# INFRA-X Backend

FastAPI backend for the INFRA-X infrastructure intelligence platform.

## Stack

- Python 3.11+
- FastAPI + Uvicorn
- **MongoDB** (PyMongo)
- Supabase Auth (token verification via supabase-py)
- **In-process YOLO** (`backend/models/best.pt`) + **XGBoost** (`backend/models/xgboost_road_risk.joblib`)

## Authentication

Supabase Auth handles registration, login, sessions, and tokens on the **React frontend**.

The backend verifies Supabase access tokens and stores application data in **MongoDB**.

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Prefer CPU PyTorch on cloud / lean local installs (torch + torchvision must match):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
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
| `ML_PROVIDER` | Asset `/api/predictions` stub only (`real`/`mock`/`xgboost`). Inspection always uses real YOLO+XGBoost. |
| `YOLO_MODEL_PATH` | Optional override; default `backend/models/best.pt` |
| `XGBOOST_MODEL_PATH` | Optional override; default `backend/models/xgboost_road_risk.joblib` |

## Models

```
backend/models/best.pt                 # YOLOv8m road damage
backend/models/xgboost_road_risk.joblib
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

## Render (single Web Service)

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

No separate YOLO service. Do **not** set `YOLO_SERVICE_URL`.

## Tests

```bash
pytest
```

Tests use `mongomock` — no live MongoDB required for the test suite.
