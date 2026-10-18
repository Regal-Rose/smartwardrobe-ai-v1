# SmartWardrobe AI API

## Local setup (Windows PowerShell)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API health: http://localhost:8000/api/health
Interactive API docs: http://localhost:8000/docs

The SQLite database is created automatically on first run. Passwords are stored as PBKDF2-HMAC-SHA256 hashes; the session cookie is HttpOnly and SameSite=Lax. For deployment, set `SMARTWARDROBE_SECRET` to a strong random secret, set `COOKIE_SECURE=true` behind HTTPS, and set `FRONTEND_ORIGINS` to the exact deployed frontend origin. Do not expose this development configuration publicly.

## Current scope

Implemented: registration, login, current-session endpoint, logout, SQLite user storage, password hashing, signed HttpOnly session cookie.

Not yet implemented: per-user garment/outfit persistence endpoints, password reset/email verification, rate limiting, production CSRF/origin strategy, AI outfit generation, virtual try-on, and deployment. Do not describe these as complete until implemented and tested.


Garment records are stored in the SQLite `garments` table and scoped to the logged-in user. The local prototype stores uploaded image data URLs inside each garment JSON payload; for production, move images to object storage and add stricter upload size/type validation.
