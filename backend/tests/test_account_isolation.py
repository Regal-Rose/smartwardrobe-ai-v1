"""Regression tests for per-account wardrobe and outfit isolation."""
import importlib
import sys
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
import main  # noqa: E402


def register(client: TestClient, name: str, email: str):
    response = client.post("/api/v1/auth/register", json={"name": name, "email": email, "password": "StrongPass123!"})
    assert response.status_code == 201, response.text
    return response.json()


def garment_payload(name="Blue Denim Jacket"):
    return {"name": name, "category": "outerwear", "subcategory": "denim-jacket", "style": "western", "color": "blue", "season": "all-season", "occasions": ["casual"], "tags": [], "notes": "", "imageData": ""}


def outfit_payload(garment_id: str):
    return {"id": "outfit-test-1", "name": "Test outfit", "items": [{"garmentId": garment_id, "role": "layer"}], "occasion": "casual", "season": "all-season", "style": "western", "dateCreated": "2026-10-18T00:00:00Z", "isSaved": True}


def test_accounts_cannot_read_or_save_each_others_garments(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "test.db")
    main.init_db()
    with TestClient(main.app) as client_a, TestClient(main.app) as client_b:
        register(client_a, "Account A", "a@example.com")
        garment = client_a.post("/api/v1/garments", json=garment_payload()).json()
        register(client_b, "Account B", "b@example.com")
        assert client_b.get("/api/v1/garments").json() == []
        assert client_b.get(f"/api/v1/garments/{garment['id']}").status_code == 404
        response = client_b.post("/api/v1/outfits", json=outfit_payload(garment["id"]))
        assert response.status_code == 422


def test_saved_outfits_and_preferences_are_account_scoped(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "test.db")
    main.init_db()
    with TestClient(main.app) as client_a, TestClient(main.app) as client_b:
        register(client_a, "Account A", "a2@example.com")
        garment = client_a.post("/api/v1/garments", json=garment_payload()).json()
        assert client_a.post("/api/v1/outfits", json=outfit_payload(garment["id"])).status_code == 201
        client_a.put("/api/v1/preferences", json={"favoriteColors": ["cobalt"]})
        register(client_b, "Account B", "b2@example.com")
        assert client_b.get("/api/v1/outfits").json() == []
        assert client_b.get("/api/v1/preferences").json()["favoriteColors"] != ["cobalt"]


def test_deleting_garment_cleans_up_saved_outfit_references(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "test.db")
    main.init_db()
    with TestClient(main.app) as client:
        register(client, "Account A", "cleanup@example.com")
        garment = client.post("/api/v1/garments", json=garment_payload()).json()
        client.post("/api/v1/outfits", json=outfit_payload(garment["id"]))
        assert client.delete(f"/api/v1/garments/{garment['id']}").status_code == 204
        assert client.get("/api/v1/outfits").json() == []


def test_wardrobe_search_matches_category_colour_and_subcategory(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "search.db")
    main.init_db()
    with TestClient(main.app) as client:
        register(client, "Search User", "search@example.com")
        client.post("/api/v1/garments", json=garment_payload("Blue Denim Jacket"))
        assert len(client.get("/api/v1/garments", params={"search": "blue"}).json()) == 1
        assert len(client.get("/api/v1/garments", params={"search": "denim jacket"}).json()) == 1
        assert len(client.get("/api/v1/garments", params={"search": "outerwear"}).json()) == 1
        assert client.get("/api/v1/garments", params={"search": "saree"}).json() == []
