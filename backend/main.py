"""SmartWardrobe AI authentication API. Local-first SQLite backend."""
import hashlib, hmac, os, secrets, sqlite3, json, uuid
from contextlib import closing
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from itsdangerous import BadSignature, URLSafeTimedSerializer

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("SMARTWARDROBE_DB", str(ROOT / "smartwardrobe.db")))
SECRET_KEY = os.getenv("SMARTWARDROBE_SECRET", "DEV-ONLY-change-this-secret-before-deploying-2026")
FRONTEND_ORIGINS = [x.strip() for x in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_NAME = "sw_session"
SESSION_MAX_AGE = 60 * 60 * 24 * 7
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="smartwardrobe-session-v1")
app = FastAPI(title="SmartWardrobe AI API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=FRONTEND_ORIGINS, allow_credentials=True, allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], allow_headers=["Content-Type"])

class RegisterPayload(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with closing(connect()) as db:
        db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
        db.execute("CREATE TABLE IF NOT EXISTS garments (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)")
        db.execute("CREATE TABLE IF NOT EXISTS outfits (id TEXT NOT NULL, user_id INTEGER NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id,user_id), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)")
        db.execute("CREATE TABLE IF NOT EXISTS preferences (user_id INTEGER PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)")
        db.commit()

def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256$310000${salt.hex()}${digest.hex()}"

def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, rounds, salt_hex, digest_hex = encoded.split("$")
        if scheme != "pbkdf2_sha256": return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(rounds)).hex()
        return hmac.compare_digest(digest, digest_hex)
    except (ValueError, TypeError): return False

def user_from_request(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if not token: return None
    try: uid = serializer.loads(token, max_age=SESSION_MAX_AGE)
    except BadSignature: return None
    with closing(connect()) as db:
        row = db.execute("SELECT id, name, email, created_at FROM users WHERE id=?", (uid,)).fetchone()
        return dict(row) if row else None

def set_session(response: Response, user_id: int):
    response.set_cookie(COOKIE_NAME, serializer.dumps(user_id), max_age=SESSION_MAX_AGE, httponly=True, secure=COOKIE_SECURE, samesite="lax", path="/")

@app.on_event("startup")
def startup(): init_db()

@app.get("/api/health")
def health(): return {"status": "ok", "service": "smartwardrobe-api"}

@app.post("/api/v1/auth/register", status_code=201)
def register(payload: RegisterPayload, response: Response):
    name = payload.name.strip(); email = str(payload.email).strip().lower()
    if len(name) < 2: raise HTTPException(422, "Please enter a name with at least 2 characters.")
    with closing(connect()) as db:
        try:
            cur = db.execute("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)", (name, email, hash_password(payload.password)))
            db.commit(); uid = cur.lastrowid
        except sqlite3.IntegrityError: raise HTTPException(409, "An account with this email already exists. Please log in.")
    set_session(response, uid)
    return {"id": uid, "name": name, "email": email}

@app.post("/api/v1/auth/login")
def login(payload: LoginPayload, response: Response):
    email = str(payload.email).strip().lower()
    with closing(connect()) as db: row = db.execute("SELECT id,name,email,password_hash FROM users WHERE email=?", (email,)).fetchone()
    if not row or not verify_password(payload.password, row["password_hash"]): raise HTTPException(401, "Email or password is incorrect.")
    set_session(response, row["id"])
    return {"id": row["id"], "name": row["name"], "email": row["email"]}

@app.get("/api/v1/auth/me")
def me(request: Request):
    user = user_from_request(request)
    if not user: raise HTTPException(401, "Please log in to continue.")
    return user

@app.post("/api/v1/auth/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/", httponly=True, secure=COOKIE_SECURE, samesite="lax")
    return {"status": "logged_out"}


# Garment CRUD: every query is scoped to the authenticated user.
def require_user(request: Request):
    user = user_from_request(request)
    if not user:
        raise HTTPException(401, "Please log in to continue.")
    return user

class GarmentPayload(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str
    subcategory: str
    style: str
    color: str
    season: str
    occasions: list[str] = []
    tags: list[str] = []
    notes: str = ""
    imageData: str = ""

class GarmentUpdatePayload(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    category: Optional[str] = None
    subcategory: Optional[str] = None
    style: Optional[str] = None
    color: Optional[str] = None
    season: Optional[str] = None
    occasions: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    notes: Optional[str] = None
    imageData: Optional[str] = None

@app.get("/api/v1/garments")
def list_garments(request: Request, search: Optional[str] = None, category: Optional[str] = None, style: Optional[str] = None, color: Optional[str] = None, season: Optional[str] = None, sort: Optional[str] = "recently-added"):
    user = require_user(request)
    with closing(connect()) as db:
        rows = db.execute("SELECT payload FROM garments WHERE user_id=?", (user["id"],)).fetchall()
    items = [json.loads(row["payload"]) for row in rows]
    if search:
        q = search.strip().lower()
        def matches_search(g):
            searchable = [
                g.get("name", ""), g.get("category", ""), g.get("subcategory", ""),
                g.get("style", ""), g.get("color", ""), g.get("season", ""),
                g.get("notes", ""), *g.get("tags", []), *g.get("occasions", []),
            ]
            return any(q in str(value).replace("-", " ").lower() for value in searchable)
        items = [g for g in items if matches_search(g)]
    for key, value in (("category", category), ("style", style), ("color", color)):
        if value and value != "all": items = [g for g in items if g.get(key) == value]
    if season and season != "all": items = [g for g in items if g.get("season") in (season, "all-season")]
    if sort == "alphabetical": items.sort(key=lambda g: g.get("name", "").lower())
    elif sort == "category": items.sort(key=lambda g: g.get("category", ""))
    else: items.sort(key=lambda g: g.get("dateAdded", ""), reverse=True)
    return items

@app.post("/api/v1/garments", status_code=201)
def create_garment(payload: GarmentPayload, request: Request):
    user = require_user(request)
    data = payload.model_dump(by_alias=True)
    data["id"] = "g-" + uuid.uuid4().hex[:16]
    data["dateAdded"] = __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()
    with closing(connect()) as db:
        db.execute("INSERT INTO garments(id,user_id,payload) VALUES(?,?,?)", (data["id"], user["id"], json.dumps(data)))
        db.commit()
    return data

@app.get("/api/v1/garments/{garment_id}")
def get_garment(garment_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM garments WHERE id=? AND user_id=?", (garment_id, user["id"])).fetchone()
    if not row: raise HTTPException(404, "Garment not found.")
    return json.loads(row["payload"])

@app.patch("/api/v1/garments/{garment_id}")
def update_garment(garment_id: str, payload: GarmentUpdatePayload, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM garments WHERE id=? AND user_id=?", (garment_id, user["id"])).fetchone()
        if not row: raise HTTPException(404, "Garment not found.")
        data = json.loads(row["payload"])
        data.update({k:v for k,v in payload.model_dump(by_alias=True, exclude_unset=True).items() if v is not None})
        db.execute("UPDATE garments SET payload=? WHERE id=? AND user_id=?", (json.dumps(data), garment_id, user["id"]))
        db.commit()
    return data

@app.delete("/api/v1/garments/{garment_id}", status_code=204)
def delete_garment(garment_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        cur = db.execute("DELETE FROM garments WHERE id=? AND user_id=?", (garment_id, user["id"]))
        if cur.rowcount:
            # Keep saved looks internally consistent when a garment is removed.
            rows = db.execute("SELECT id, payload FROM outfits WHERE user_id=?", (user["id"],)).fetchall()
            for row in rows:
                outfit = json.loads(row["payload"])
                items = outfit.get("items", [])
                filtered = [item for item in items if not (isinstance(item, dict) and item.get("garmentId") == garment_id)]
                if len(filtered) != len(items):
                    if filtered:
                        outfit["items"] = filtered
                        db.execute("UPDATE outfits SET payload=? WHERE id=? AND user_id=?", (json.dumps(outfit), row["id"], user["id"]))
                    else:
                        db.execute("DELETE FROM outfits WHERE id=? AND user_id=?", (row["id"], user["id"]))
        db.commit()
    if cur.rowcount == 0: raise HTTPException(404, "Garment not found.")
    return Response(status_code=204)


# Saved outfits: every read/write is scoped to the authenticated account.
class OutfitPayload(BaseModel):
    id: str
    name: str
    items: list[dict] = []
    occasion: str = "everyday"
    season: str = "all-season"
    style: str = "western"
    dateCreated: str = ""
    isSaved: bool = True

@app.get("/api/v1/outfits")
def list_saved_outfits(request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        rows = db.execute("SELECT payload FROM outfits WHERE user_id=? ORDER BY created_at DESC", (user["id"],)).fetchall()
    return [json.loads(row["payload"]) for row in rows]

@app.post("/api/v1/outfits", status_code=201)
def save_outfit(payload: OutfitPayload, request: Request):
    user = require_user(request)
    data = payload.model_dump()
    # Never accept references to garments that do not belong to this account.
    garment_ids = {item.get("garmentId") for item in data.get("items", []) if isinstance(item, dict) and item.get("garmentId")}
    if garment_ids:
        placeholders = ",".join("?" for _ in garment_ids)
        with closing(connect()) as db:
            rows = db.execute(
                f"SELECT id FROM garments WHERE user_id=? AND id IN ({placeholders})",
                (user["id"], *sorted(garment_ids)),
            ).fetchall()
        owned_ids = {row["id"] for row in rows}
        missing_ids = garment_ids - owned_ids
        if missing_ids:
            raise HTTPException(422, "This outfit contains garments that are unavailable in your wardrobe. Refresh your wardrobe and try again.")
    data["isSaved"] = True
    with closing(connect()) as db:
        db.execute("INSERT INTO outfits(id,user_id,payload) VALUES(?,?,?) ON CONFLICT(id,user_id) DO UPDATE SET payload=excluded.payload", (data["id"], user["id"], json.dumps(data)))
        db.commit()
    return data

@app.get("/api/v1/outfits/{outfit_id}")
def get_saved_outfit(outfit_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM outfits WHERE id=? AND user_id=?", (outfit_id, user["id"])).fetchone()
    if not row: raise HTTPException(404, "Saved outfit not found.")
    return json.loads(row["payload"])

@app.delete("/api/v1/outfits/{outfit_id}", status_code=204)
def delete_saved_outfit(outfit_id: str, request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        cur = db.execute("DELETE FROM outfits WHERE id=? AND user_id=?", (outfit_id, user["id"]))
        db.commit()
    if cur.rowcount == 0: raise HTTPException(404, "Saved outfit not found.")
    return Response(status_code=204)

DEFAULT_PREFERENCES = {
    "preferredStyles": ["western", "indian"],
    "favoriteColors": ["black", "white", "navy", "beige"],
    "commonOccasions": ["casual", "work", "everyday"],
    "seasonalPreferences": ["all-season"],
    "preferredCategories": ["tops", "bottoms", "indian-ethnic"],
    "displayName": "",
}

@app.get("/api/v1/preferences")
def get_preferences(request: Request):
    user = require_user(request)
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM preferences WHERE user_id=?", (user["id"],)).fetchone()
        if row: return json.loads(row["payload"])
        prefs = {**DEFAULT_PREFERENCES, "displayName": user["name"]}
        db.execute("INSERT INTO preferences(user_id,payload) VALUES(?,?)", (user["id"], json.dumps(prefs)))
        db.commit()
        return prefs

@app.put("/api/v1/preferences")
def update_preferences(payload: dict, request: Request):
    user = require_user(request)
    allowed = set(DEFAULT_PREFERENCES.keys())
    clean = {k: v for k, v in payload.items() if k in allowed}
    with closing(connect()) as db:
        row = db.execute("SELECT payload FROM preferences WHERE user_id=?", (user["id"],)).fetchone()
        current = json.loads(row["payload"]) if row else {**DEFAULT_PREFERENCES, "displayName": user["name"]}
        current.update(clean)
        db.execute("INSERT INTO preferences(user_id,payload) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload, updated_at=CURRENT_TIMESTAMP", (user["id"], json.dumps(current)))
        db.commit()
    return current
