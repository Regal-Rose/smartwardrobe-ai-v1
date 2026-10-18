# SmartWardrobe AI — development build

A global wardrobe companion designed for Western and Indian clothing styles.

## Run the frontend (Windows)

1. Install Node.js LTS.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local` (defaults point to the local API).
5. Run `npm run dev` and open the local URL Vite prints.

## Run the backend

Follow `backend/README.md` in a second terminal. The frontend login/register screens require the API to be running at `http://localhost:8000`.

## What is implemented in this milestone

- Editorial public landing page before login.
- Login and account registration screens.
- FastAPI authentication API with SQLite, password hashing and signed HttpOnly session cookie.
- Protected existing wardrobe/dashboard routes.
- Existing wardrobe screens retained.

## Important limitations

The current wardrobe repositories still use mock data. Authentication is real, but garment/outfit data is not yet persisted per account. AI outfit suggestions and virtual try-on are not implemented by this milestone. Use a strong `SMARTWARDROBE_SECRET` and HTTPS/secure cookies before any public deployment. This is a development milestone, not a production security audit.


## Milestone 2: persistent wardrobe data

Garment CRUD now supports the authenticated HTTP API. To enable it locally:

1. Copy `.env.example` to `.env` in the project root (PowerShell: `Copy-Item .env.example .env`).
2. Install backend dependencies if needed, then start the backend from `backend` with `python -m uvicorn main:app --reload --port 8000` (or use the venv's Python executable directly).
3. From the project root, run `npm install` and `npm run dev`.
4. Register/login, open Wardrobe, add a garment, refresh, and confirm it remains. Sign in with a different account to verify account isolation.

When `VITE_DATA_MODE=http`, garment list/create/update/delete operations use the FastAPI database. Outfit generation/saved outfits and preferences still use local mock repositories in this milestone. Uploaded garment images are stored as data URLs in SQLite, which is suitable for a local prototype but should be moved to file/object storage before production.


## Local development data mode

The frontend now defaults to `VITE_DATA_MODE=http` when the variable is not set, so authenticated users use the FastAPI garment API rather than shared browser demo data. Start the backend and copy `.env.example` to `.env` if you need to customize the API URL. To deliberately use demo data, set `VITE_DATA_MODE=mock`. Mock data is browser-local demo data and must not be used for real accounts.


## Latest milestone
See `MILESTONE-5-NOTES.md` for Outfit Studio + Discover changes and the end-to-end manual test checklist.
