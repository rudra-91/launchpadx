# Deploy INFRA-X (Vercel + Render)

Frontend on **Vercel**, backend (FastAPI + in-process YOLO + XGBoost) on **Render**.

## Architecture

```
Browser → Vercel (React/Vite)
            ├─ VITE_API_URL → Render FastAPI (/api)
            └─ Auth → Supabase
Render → JWT verify via Supabase
Render → MongoDB Atlas
Render → backend/models/best.pt + xgboost_road_risk.joblib
```

`best.pt` is stored with **Git LFS** (`*.pt` in `.gitattributes`). Render clones with LFS so weights are present at build/runtime.

---

## 1. Push code (already done if you followed the agent deploy)

Ensure `main` on GitHub includes the YOLO-in-backend merge and LFS models.

---

## 2. Render (backend)

### Create Web Service

| Setting | Value |
|---------|--------|
| Repo | your GitHub `launchpadx` |
| Root Directory | `backend` |
| Runtime | Python 3.11+ |
| Build Command | `pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/health` |
| Instance | **Standard** or higher (YOLO+torch needs more than free 512MB) |

You can also use Blueprint: connect the repo and apply root [`render.yaml`](render.yaml).

### Environment variables

| Variable | Example / notes |
|----------|-----------------|
| `MONGODB_URL` | Atlas connection string |
| `MONGODB_DB_NAME` | `infrax` |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | same publishable key as the frontend |
| `FRONTEND_URL` | `https://<your-app>.vercel.app` (set after Vercel exists; no trailing slash) |
| `ML_PROVIDER` | `real` |

Do **not** set `YOLO_SERVICE_URL` (removed; YOLO runs in-process).

Optional overrides:

- `YOLO_MODEL_PATH` — default resolves to `backend/models/best.pt`
- `XGBOOST_MODEL_PATH` — default `backend/models/xgboost_road_risk.joblib`

### After deploy

Copy the public URL, e.g. `https://infrax-api.onrender.com`.

Smoke: `GET https://<service>.onrender.com/api/health` should return OK (first cold start with YOLO can take several minutes).

---

## 3. Vercel (frontend)

### Create project

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

SPA routing is handled by [`frontend/vercel.json`](frontend/vercel.json).

### Environment variables (set **before** production build)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://<render-service>.onrender.com/api` |
| `VITE_SUPABASE_URL` | same as backend `SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | same as backend publishable key |

Vite bakes env at **build** time — redeploy after changing these.

---

## 4. Wire CORS + Supabase

1. On Render, set `FRONTEND_URL` to `https://<your-app>.vercel.app` and restart the service.
2. In Supabase → **Authentication** → **URL Configuration**:
   - **Site URL:** `https://<your-app>.vercel.app`
   - **Redirect URLs:** include `https://<your-app>.vercel.app/**` and keep `http://localhost:5173/**` for local dev.

CORS already allows `FRONTEND_URL` plus local Vite ports (`5173` / `5174`).

---

## 5. Deploy order checklist

1. [ ] Code + LFS models on `origin/main`
2. [ ] Create/deploy Render → copy public URL
3. [ ] Create Vercel project → set env → deploy
4. [ ] Set Render `FRONTEND_URL` → restart Render
5. [ ] Update Supabase Site URL + Redirect URLs
6. [ ] Smoke test (below)

---

## 6. Smoke test

1. Open the Vercel URL; confirm landing/login loads.
2. Sign in with Supabase auth.
3. In DevTools → Network, confirm API calls go to `https://<render>.onrender.com/api/...`.
4. Hit `/api/health` (browser or curl) — expect healthy + models loaded when warm.
5. Road Inspection: upload one image and confirm detections + risk result.
6. If the first upload times out, wait for cold start / model warm-up and retry (keep images reasonably small).

---

## Known risks

- **Cold start:** YOLO load on Render can take minutes; first request may time out until warm.
- **RAM:** Free tier often OOMs with Ultralytics + torch; prefer Standard+.
- **Timeouts:** Long analyze requests may hit proxy limits; raise Render request timeout if needed.
