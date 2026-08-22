You are a senior full-stack engineer.

Build a production-quality MVP called **INFRA-X**.

IMPORTANT:
- Do NOT implement the AI/ML model yet.
- The system must be designed so an AI prediction model can be plugged in later.
- Use clean architecture, reusable components, TypeScript, and modern best practices.

# Tech Stack

Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- React Query (TanStack Query)
- Zustand (state management)
- Recharts (charts)
- MapLibre GL JS (interactive maps)
- Lucide React (icons)

Backend
├── Python 3.11+
├── FastAPI
├── Pydantic
├── SQLAlchemy
├── PostgreSQL
├── Alembic
├── Supabase Auth
├── supabase-py
├── CORS
└── Uvicorn

Database
- PostgreSQL (application data via SQLAlchemy)
- Supabase Auth (identity/authentication — separate from app DB)

**Do NOT use for backend:** Node.js, Express.js, TypeScript backend, Prisma, Zod, Helmet, Morgan, custom JWT auth, Passlib, bcrypt.

# DESIGN SYSTEM

## Enterprise Infrastructure Intelligence UI — Visual & Interaction Refinement

Refine the existing website into a **professional, enterprise-grade infrastructure intelligence platform** suitable for government, engineering, infrastructure analytics, and hackathon judging.

The existing functionality, information architecture, layout, navigation, and content should remain intact unless a change is required to improve visual consistency or usability.

The primary goal is to eliminate any **"vibe-coded", overly decorative, gradient-heavy, or generic AI-dashboard appearance** and replace it with a restrained, intentional, premium enterprise aesthetic.

---

# 1. Design Direction

The interface should communicate:

* Government-grade reliability
* Infrastructure intelligence
* Technical precision
* Data-driven decision making
* Professional enterprise software
* Premium but restrained visual design

Use visual references from products such as:

* Linear
* Apple professional applications
* Stripe
* Palantir
* Bloomberg Terminal
* Modern enterprise GIS / infrastructure platforms

Do **not** copy their interfaces. Use them only as references for restraint, spacing, hierarchy, and polish.

The UI should feel **designed by a professional product designer**, not generated from a generic SaaS template.

---

# 2. Color System

Use a strict, controlled color system.

### Base Colors

```text
Background:        #050505
Surface:           #0A0A0A
Elevated Surface:  #111111
Card:              #121212
Primary Text:      #FAFAFA
Secondary Text:    #D4D4D8
Muted Text:        #A1A1AA
Border:            rgba(255,255,255,0.08)
Border Strong:     rgba(255,255,255,0.12)
```

### Semantic Colors

```text
Accent Blue:      #60A5FA
Accent Cyan:      #38BDF8
Success:          #22C55E
Warning:          #F59E0B
Critical:         #EF4444
```

### Critical Styling Rule

**Do not use decorative gradients.**

Avoid:

* Blue-to-purple gradients
* Cyan-to-blue gradients
* Gradient text
* Gradient buttons
* Gradient cards
* Large radial gradients
* Mesh gradients
* Colorful background gradients
* Excessive glowing gradients

The interface should primarily use **solid near-black surfaces with subtle contrast**.

If a gradient is absolutely necessary for a functional visual element, keep it extremely subtle and localized. It must never become a dominant visual feature.

---

# 3. Surfaces & Cards

Use a restrained layered-surface system instead of obvious glassmorphism.

### Surface hierarchy

```text
Page background     → #050505
Primary surfaces    → #0A0A0A
Elevated surfaces   → #111111
Cards               → #121212
```

Cards should have:

* 1px translucent borders
* 20–24px border radius where appropriate
* Subtle depth through surface contrast
* Minimal shadows
* Consistent internal padding
* Strong alignment and spacing

Avoid:

* Excessive blur
* Transparent cards floating over gradients
* Heavy shadows
* Glowing borders
* Neon outlines
* Overly translucent UI

Use backdrop blur only when it genuinely improves hierarchy and remains subtle.

---

# 4. Borders & Dividers

Borders should be understated.

Primary border:

```text
rgba(255,255,255,0.08)
```

Stronger interactive border:

```text
rgba(255,255,255,0.12)
```

Use borders to define structure rather than decoration.

Do not create glowing borders or high-contrast outlines around every component.

---

# 5. Accent Usage

Blue should be treated as a **functional accent**, not a decorative theme.

Use `#60A5FA` for:

* Active navigation
* Important buttons
* Selected states
* Links
* Data highlights
* Interactive controls
* Focus states

Use `#38BDF8` sparingly for:

* Special data visualization highlights
* Subtle active indicators
* Very restrained ambient effects

The majority of the interface should remain neutral black, gray, and white.

A useful rule:

> **90% neutral surfaces and typography, 10% functional color accents.**

---

# 6. Typography

Use **Inter** throughout the interface.

Typography should prioritize clarity and information hierarchy.

### Headings

* Bold or semibold
* High contrast
* Tight but natural letter spacing
* Avoid oversized marketing-style typography

### Body

* Medium or regular weight
* Comfortable line height
* Strong readability
* Muted secondary information

### Data

Important metrics should be visually prominent without appearing flashy.

Avoid:

* Gradient text
* Glow text
* Excessive uppercase typography
* Decorative typography
* Huge hero headlines that overpower the dashboard

---

# 7. Layout & Spacing

Use a consistent **8px spacing system**.

Prioritize:

* Generous whitespace
* Strong alignment
* Consistent component dimensions
* Clear visual hierarchy
* Predictable spacing between sections

Maintain the existing layout unless improvements are necessary.

Do not redesign the product simply for visual novelty.

The interface should feel dense enough for an intelligence platform while remaining easy to scan.

---

# 8. Dashboard Cards

Dashboard metrics should look like serious enterprise analytics components.

Use:

* Clear metric hierarchy
* Small supporting labels
* Subtle trend indicators
* Restrained semantic colors
* Minimal icons
* Consistent card dimensions

Avoid:

* Huge decorative icons
* Glowing cards
* Gradient backgrounds
* Excessive illustrations
* Floating decorative elements

The data itself should remain the visual priority.

---

# 9. Map / Infrastructure Visualization

The map should remain visually dominant where geographic intelligence is important.

Keep the map dark and restrained.

Use accent colors only to communicate:

* Asset type
* Risk
* Condition
* Alerts
* Selected infrastructure

Avoid turning the map into a neon cyberpunk visualization.

The map should resemble a **professional infrastructure/GIS intelligence system**, not a sci-fi interface.

---

# 10. Three.js — Subtle 3D Enhancement

Use **Three.js instead of GSAP for the primary visual animation layer**.

Three.js should enhance the perception of depth and technical sophistication without becoming the focus of the interface.

### Important:

The 3D system must be **minimal, lightweight, and secondary to the UI**.

Prefer one cohesive 3D visual language rather than many unrelated effects.

Suitable applications include:

* Extremely subtle abstract infrastructure/network geometry
* Low-density particles
* Thin wireframe structures
* Slow-moving spatial nodes
* Subtle depth layers
* Minimal 3D network connections
* Gentle camera movement
* Very subtle floating geometry

The visual language should relate conceptually to:

**infrastructure + networks + spatial intelligence + data systems**

rather than generic futuristic 3D graphics.

---

# 11. Three.js Visual Restrictions

Do NOT use:

* Constant spinning objects
* Large 3D objects covering content
* Neon particle explosions
* Excessive bloom
* Sci-fi portals
* Giant glowing spheres
* Complex animated backgrounds
* Rapid camera movement
* Heavy particle systems
* Distracting 3D illustrations
* Cyberpunk visuals

The user should notice the **interface first** and the 3D layer second.

If removing the 3D effect makes the interface clearer, remove it.

---

# 12. Three.js Performance

Keep the implementation lightweight.

Optimize for:

* Desktop
* Laptop
* Tablet
* Mobile

Use:

* Low-poly geometry
* Low particle counts
* Limited draw calls
* Device-aware pixel ratio
* Efficient render loops
* Minimal post-processing
* No unnecessary continuous rendering

Reduce visual complexity on mobile.

Avoid effects that significantly increase:

* GPU usage
* CPU usage
* Memory consumption
* Battery usage
* Initial page load time

If the 3D scene is not visible or necessary, pause or reduce rendering where practical.

---

# 13. Interaction & Motion

Animations should communicate state and hierarchy rather than exist purely for decoration.

Use subtle motion for:

* Hover states
* Button interactions
* Card elevation
* Navigation selection
* Data updates
* Panel transitions
* Map interactions
* 3D depth/parallax

Motion should feel:

* Smooth
* Controlled
* Predictable
* Fast enough for professional software
* Never theatrical

Avoid:

* Bouncing
* Elastic UI
* Excessive scaling
* Rapid rotations
* Flashing
* Constant movement
* Attention-grabbing transitions

---

# 14. Hover States

Add tasteful interaction to:

* Buttons
* Cards
* Navigation items
* Important CTAs
* Map assets
* Interactive controls

Examples:

* Slight surface elevation
* Subtle border brightening
* Small translation
* Very restrained scale change
* Soft accent highlight

Do not make every component glow when hovered.

---

# 15. Depth & Parallax

Where appropriate, use subtle Three.js depth or mouse movement in the hero/visual layer.

The movement should be extremely small.

The goal is to create a sense of **spatial depth**, not a noticeable parallax effect.

The content must remain stable and readable.

---

# 16. Accessibility & Reduced Motion

Respect:

```css
prefers-reduced-motion: reduce
```

When reduced motion is enabled:

* Disable unnecessary 3D movement
* Stop continuous animations
* Remove parallax
* Minimize transitions
* Keep essential state changes instantaneous or very subtle

The application must remain completely usable without animation.

---

# 17. Responsive Behavior

The visual system must work across:

* Large desktop
* Standard laptop
* Tablet
* Mobile

On mobile:

* Reduce or disable unnecessary 3D effects
* Reduce particle density
* Reduce rendering resolution
* Avoid expensive effects
* Prioritize content and interaction
* Never allow animation to interfere with navigation or readability

---

# 18. Visual Consistency Rules

Maintain:

* Existing color palette
* Existing typography
* Existing information architecture
* Existing layout
* Existing component purpose
* Existing functionality

Improve only the **visual quality, consistency, interaction, and depth**.

Do not introduce random design trends.

Do not add decorative elements simply because they are visually impressive.

Every visual effect should have a purpose.

---

# 19. Anti "Vibe-Coded" Rules

The final implementation must specifically avoid the common characteristics of AI-generated dashboard designs:

* No excessive gradients
* No gradient text
* No neon cyberpunk aesthetic
* No excessive glassmorphism
* No giant glowing blobs
* No excessive rounded containers
* No random floating shapes
* No decorative particles everywhere
* No excessive shadows
* No unnecessary animations
* No rainbow color systems
* No generic SaaS hero sections
* No oversized decorative icons
* No visual effects competing with data

The design should communicate:

> **Precision over decoration.
> Information over spectacle.
> Function over visual noise.**

---

# 20. Final Quality Target

The finished product should feel like a **real production-grade infrastructure intelligence platform**, not a concept page or AI-generated demo.

The visual hierarchy should be:

**Data → Function → Navigation → Interaction → Visual enhancement**

not:

**Animation → Glow → Gradient → Decoration → Data**

The final result should be:

* Premium
* Minimal
* Technical
* Professional
* Trustworthy
* Government-ready
* Performance-conscious
* Modern without being trendy
* Visually restrained
* Clearly intentional

Use Three.js as a **subtle layer of depth and sophistication**, not as the main attraction.

When evaluating any visual effect, ask:

> **"Does this make the product feel more credible and professional, or does it simply make it look more animated?"**

If it only makes the interface more animated, do not implement it.

# Application Name

INFRA-X

Subtitle:
Temporal Infrastructure Risk Intelligence

# Pages

Create these pages.

1. Login
- Email/password via **Supabase Auth** (React client)
- Session access token sent to FastAPI as `Authorization: Bearer <token>`
- Beautiful dark UI

2. Dashboard
Contains:

Top navbar
- INFRA-X logo
- Notifications
- User profile

Sidebar
- Dashboard
- Assets
- Network
- Simulation
- Optimizer
- Analytics
- Settings

Main dashboard

Metric cards

- Total Assets
- Critical Assets
- Network Risk %
- Average Condition

Interactive Map
Use MapLibre with dummy GeoJSON.

Show:
- Bridges
- Roads
- Hospitals

Markers:
Green = Low
Yellow = Medium
Orange = High
Red = Critical

Charts
- Condition trend
- Risk distribution
- Asset categories
- Monthly inspections

3. Assets Page

Table with:

Bridge ID
Name
Condition
Risk
Traffic
Status
Action button

Filters:
- Search
- Risk
- Asset type
- Condition

Click opens Asset Detail.

4. Asset Detail

Show:

Bridge name

Cards

Current Condition

Predicted Condition (dummy value)

Risk Score

Confidence

Degradation chart

Feature importance chart

Information section

Latitude

Longitude

Traffic

Age

Material

Buttons

Simulate

Recommend Maintenance

5. Network Page

Show network visualization layout.

Display:
Bridge → Road → Hospital relationships.

Use nodes and connecting lines.

Include right panel:

Affected Roads

Affected Hospitals

Cascade Risk

6. Simulation Page

Create What-if simulation UI.

Inputs:

Select bridge

Repair quality

Budget

Buttons:

Run Simulation

Output cards:

Before Risk

After Risk

Risk Reduction

Estimated Access Time

Use mocked backend responses.

7. Optimizer Page

Input:

Available Budget

Priority Strategy

Safety

Accessibility

Economic Impact

Output:

Ranked maintenance list

Priority score

Estimated budget used

Expected network improvement

# Backend Architecture

## Team Responsibilities

**Backend (FastAPI):** REST APIs, auth, business logic, risk scoring, network/maintenance/simulation services, ML abstraction layer.

**ML Team (separate):** NBI data → preprocessing → feature engineering → XGBoost training → evaluation → SHAP → saved model.

The backend **must not** train models, invent ML metrics, or hard-code the final NBI feature list.

## Architecture Flow

```
React → Supabase Auth → Supabase Access Token → FastAPI → Verified User → Backend Services → ML Prediction Service → MockPredictor | ModelPredictor → JSON → React
```

## Backend Stack (use only this)

- Python 3.11+
- FastAPI
- Pydantic / Pydantic Settings
- SQLAlchemy
- PostgreSQL
- Alembic
- Supabase Auth
- supabase-py
- CORS
- Uvicorn
- Python standard logging

**Do NOT implement:** custom JWT creation, password hashing, bcrypt, Passlib, custom login sessions, or custom refresh tokens. Supabase Auth owns authentication.

## Authentication Architecture

```
React → Supabase Auth → Access Token → Authorization: Bearer <token> → FastAPI → Verify Supabase JWT → Protected API
```

- Frontend uses Supabase client for sign-up, sign-in, logout, sessions
- Backend **only verifies** Supabase access tokens and authorizes resources
- FastAPI must **not** handle passwords or issue its own JWTs

## Mock ML First

Create `app/services/ml/`:

- `prediction_service.py`
- `mock_predictor.py`
- `model_predictor.py`

```
PredictionService
    ├── MockPredictor      (ML_PROVIDER=mock)
    └── ModelPredictor     (ML_PROVIDER=xgboost, future)
```

Development: `ML_PROVIDER=mock`. Production ML: `ML_PROVIDER=xgboost` when model is provided.

The frontend API contract must **not** change when the real model is integrated.

## Backend Structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── api/routes/
│   │   ├── auth.py
│   │   ├── assets.py
│   │   ├── predictions.py
│   │   ├── risk.py
│   │   ├── maintenance.py
│   │   ├── network.py
│   │   ├── simulation.py
│   │   └── metrics.py
│   ├── dependencies/
│   │   ├── auth.py
│   │   └── permissions.py
│   ├── models/
│   │   ├── user_profile.py
│   │   ├── asset.py
│   │   ├── prediction.py
│   │   ├── simulation.py
│   │   └── network.py
│   ├── schemas/
│   ├── services/
│   │   └── ml/
├── alembic/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## Database Models

UserProfile, Asset, Prediction, Simulation, NetworkNode, NetworkEdge

**UserProfile** (application profile — not auth credentials):
- `supabase_user_id` (maps to Supabase Auth user ID)
- `display_name`
- `role` (`user` | `admin`)
- no passwords stored

Asset fields: asset_id, name, type, latitude, longitude, condition, predicted_condition, risk_score, confidence, traffic, age, material, status

Do **not** copy every NBI column into PostgreSQL. ML feature set is controlled by the ML team.

## Authentication

Handled by **Supabase Auth** on the frontend (register, login, logout, sessions).

FastAPI backend:
- **GET /api/auth/me** — requires valid Supabase access token; returns application profile
- All other routes (except `/api/health`) require `Authorization: Bearer <supabase_access_token>`

Do **not** implement `POST /api/auth/register` or `POST /api/auth/login` in FastAPI.

### FastAPI auth dependency

`app/dependencies/auth.py` — `get_current_user()`:

1. Read `Authorization: Bearer <supabase_access_token>`
2. Verify token via Supabase (`supabase.auth.get_user`)
3. Extract authenticated Supabase user ID from verified claims (never trust client-supplied IDs)
4. Load/create `UserProfile` in PostgreSQL
5. Return HTTP 401 for missing/invalid/expired tokens

`app/dependencies/permissions.py` — `require_admin()` for future admin-only routes.

### Roles

Application roles stored in PostgreSQL `UserProfile.role`:

- `user` (default)
- `admin`

## Error Handling

| Case | HTTP |
|------|------|
| Missing/invalid auth | 401 |
| Insufficient permissions | 403 |
| Missing asset | 404 |
| Validation error | 422 |
| Server error | 500 |

## Security

- Supabase Auth + verified access tokens only
- HTTPS in production
- CORS restricted to `FRONTEND_URL`
- Never store passwords, log tokens, or expose backend secrets to React

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | Public | Health check |
| GET | /api/auth/me | Protected | Current user profile |
| GET | /api/assets | Protected | List assets |
| GET | /api/assets/{id} | Protected | Asset detail |
| POST | /api/predictions/{asset_id} | Protected | Run prediction |
| GET | /api/predictions/{asset_id} | Protected | Get prediction |
| GET | /api/risk/{asset_id} | Protected | Application risk score |
| GET | /api/maintenance/priorities | Protected | Ranked maintenance list |
| GET | /api/maintenance/{asset_id} | Protected | Asset maintenance info |
| GET | /api/network | Protected | Full network graph |
| GET | /api/network/{id} | Protected | Node + cascade impact |
| POST | /api/simulate | Protected | What-if simulation |
| POST | /api/optimize | Protected | Budget optimizer |
| GET | /api/metrics | Protected | Dashboard metrics |

## Response Format

Success:
```json
{ "success": true, "data": {} }
```

Error:
```json
{ "success": false, "error": { "code": "ASSET_NOT_FOUND", "message": "Asset not found" } }
```

## Prediction Response Example (demo values)

```json
{
  "success": true,
  "data": {
    "assetId": "B17",
    "currentCondition": 67,
    "predictedCondition": 59,
    "deterioration": 8,
    "riskScore": 82,
    "riskLevel": "HIGH",
    "confidence": 0.91,
    "featureImportance": []
  }
}
```

## Risk Service

ML predicts **condition**. Backend calculates **application-level risk score** from condition, predicted condition, deterioration, and application factors.

Levels: LOW, MEDIUM, HIGH, CRITICAL

This is **not** a probability of bridge collapse — it is decision-support scoring.

## Simulation & Optimization

- Simulation: rule-based what-if (repair quality, budget) — clearly labeled as simulated assumptions
- Optimization: deterministic rule-based MVP — no additional ML model

## Seed Data

At least 30 bridges, 20 roads, 8 hospitals with network relationships. Mock ML returns deterministic demo values.

## Environment (.env.example)

```
SUPABASE_URL=https://mxuqgcmkxbfspzpopupx.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_KCIejuGIPP02CsrKkyu26g_LV8hEmnb
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/infrax
FRONTEND_URL=http://localhost:5173
ML_PROVIDER=mock
```

Use PostgreSQL for application data (SQLAlchemy). Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` or other server secrets to the React frontend. Optional backend-only service role key may be stored in backend `.env` only.

## Frontend Auth

React uses `@supabase/supabase-js` for authentication. Attach the Supabase session access token to API requests:

```
Authorization: Bearer <supabase_access_token>
```

## Testing

Test health, auth, assets, predictions, risk, simulation, optimization, metrics in `ML_PROVIDER=mock` mode.

## Run Backend

```bash
uvicorn app.main:app --reload
```

Swagger docs at `/docs`.

## Do NOT Overengineer

No Kubernetes, microservices, Kafka, Redis, GNN, PyTorch, satellite processing, or real-time streaming for this hackathon MVP.

# Folder Structure

```
infra-x/
  frontend/     # React + TypeScript (existing)
  backend/      # FastAPI + SQLAlchemy
  readme/
```

# Component Requirements

Reusable components:

MetricCard

RiskBadge

ConditionBar

AssetTable

MapView

NetworkGraph

TrendChart

FeatureImportanceChart

BudgetInput

PriorityList

GlassCard

LoadingSkeleton

# State Management

Use Zustand for:

User

Filters

Selected Asset

Simulation State

Theme

Use React Query for API calls.

# Animations

Use Framer Motion.

Animate:

Cards

Sidebar

Charts

Page transitions

Hover interactions

# ML Integration Layer

Do **not** implement ML training in the backend.

Create abstraction in `app/services/ml/`:

- `PredictionService` → `MockPredictor` | `ModelPredictor`
- `predict_condition()` — mock now, XGBoost later via friend's `.joblib` / prediction function in `model_predictor.py`
- Backend `risk_service` calculates application risk from prediction outputs
- `simulation_service` and `maintenance_service` use rule-based logic

The application must start and run fully in `ML_PROVIDER=mock` without any model file present.

# API Response Example

GET /api/assets/:id

{
  "assetId":"B17",
  "name":"Bridge B17",
  "condition":67,
  "predictedCondition":59,
  "riskScore":82,
  "confidence":91,
  "traffic":47000,
  "age":38,
  "material":"Steel",
  "latitude":35.21,
  "longitude":-80.55
}

# Code Quality

**Frontend:** Strict TypeScript, ESLint, absolute imports, responsive UI.

**Backend:** Pydantic validation, typed services, pytest, centralized exception handling, secure configuration, modular but simple architecture.

Generate a working React frontend and FastAPI backend with seed data, mock ML, and a clear path to XGBoost integration.

