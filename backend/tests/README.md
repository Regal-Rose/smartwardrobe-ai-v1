# Backend regression tests

Install backend dependencies, plus test tools:

```bash
pip install -r requirements.txt pytest httpx
python -m pytest backend/tests -q
```

Run the command from the project root. Tests use temporary SQLite databases and do not modify your normal local database.
