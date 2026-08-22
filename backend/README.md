# INFRA-X Backend

FastAPI backend for the INFRA-X infrastructure intelligence platform.

## Stack

- Python 3.11+
- FastAPI + Uvicorn
- **MongoDB** (PyMongo)
- Supabase Auth (token verification via supabase-py)
- Mock ML provider (XGBoost-ready)

## Authentication

Supabase Auth handles registration, login, sessions, and tokens on the **React frontend**.

The backend verifies Supabase access tokens and stores application data in **MongoDB**.

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
```

## Environment

| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB connection string (Atlas `mongodb+srv://...`) |
| `MONGODB_DB_NAME` | Database name (default: `infrax`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key for token verification |
| `FRONTEND_URL` | CORS origin |
| `ML_PROVIDER` | `mock` or `xgboost` |

## Database

Seed INFRA-X infrastructure data into MongoDB:

```bash
python -m app.seed
```

Force re-seed (clears INFRA-X collections and removes legacy `movies` collection if present):

```bash
python -m app.seed --force
```

Collections:

- `assets` — bridges, roads, hospitals
- `user_profiles` — application roles linked to Supabase user IDs
- `predictions`, `simulations`, `network_nodes`, `network_edges`

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

## Tests

```bash
pytest
```

Tests use `mongomock` — no live MongoDB required for the test suite.

## API Overview

- `GET /api/auth/me` (protected)
- `GET /api/assets` · `GET /api/assets/{id}`
- `POST /api/predictions/{asset_id}` · `GET /api/predictions/{asset_id}`
- `GET /api/risk/{asset_id}`
- `GET /api/maintenance/priorities` · `GET /api/maintenance/{asset_id}`
- `GET /api/network` · `GET /api/network/{id}`
- `POST /api/simulate` · `POST /api/optimize`
- `GET /api/metrics`
- `GET /api/health` (public)
