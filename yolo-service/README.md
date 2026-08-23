# INFRA-X YOLO Inference Service

Self-contained FastAPI service for YOLOv8m road-damage detection.
Used by the launchpadx backend via `YOLO_SERVICE_URL`.

## Layout

```
yolo-service/
├── main.py              # FastAPI app (/health, /predict)
├── requirements.txt
├── Procfile             # cloud startup
├── models/
│   └── best.pt          # production weights (~50 MB)
└── README.md
```

## Local run

```bash
cd yolo-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

## Cloud / production startup

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Or use the included `Procfile`.

## Endpoints (unchanged contract)

- `GET /health` → `{ status, model, model_loaded }`
- `POST /predict?conf=0.25` with multipart field `image`

## Optional env

| Variable | Default | Purpose |
|----------|---------|---------|
| `YOLO_MODEL_PATH` | `models/best.pt` (relative to this folder) | Override model file path |
| `PORT` | `8001` locally | HTTP port |

## LaunchpadX backend

Set in the backend environment (Render, etc.):

```
YOLO_SERVICE_URL=https://your-yolo-service.onrender.com
```

Local default remains `http://127.0.0.1:8001`.
