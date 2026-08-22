import mongomock
import pytest
from fastapi.testclient import TestClient

from app.core.database import ensure_indexes, reset_database, set_database
from app.dependencies.auth import get_current_user
from app.main import app
from app.schemas.auth import AuthenticatedUser
from app.seed import seed

client = TestClient(app)

TEST_USER = AuthenticatedUser(
    supabase_user_id="00000000-0000-4000-8000-000000000001",
    email="admin@infra-x.gov",
    role="admin",
    display_name="Admin User",
)


@pytest.fixture(autouse=True)
def setup_db():
    reset_database()
    mongo = mongomock.MongoClient()
    set_database(mongo, "infrax_test")
    db = mongo["infrax_test"]
    ensure_indexes(db)
    seed(db, force=True)
    yield
    reset_database()


@pytest.fixture(autouse=True)
def auth_override():
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    yield
    app.dependency_overrides.clear()


def auth_headers() -> dict[str, str]:
    return {"Authorization": "Bearer test-access-token"}


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_unauthenticated_assets_returns_401():
    app.dependency_overrides.clear()
    response = client.get("/api/assets")
    assert response.status_code == 401
    assert response.json()["success"] is False
    app.dependency_overrides[get_current_user] = lambda: TEST_USER


def test_auth_me():
    response = client.get("/api/auth/me", headers=auth_headers())
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["id"] == TEST_USER.supabase_user_id
    assert body["data"]["role"] == "admin"


def test_assets_listing():
    response = client.get("/api/assets", headers=auth_headers())
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 30


def test_asset_detail():
    response = client.get("/api/assets/B17", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["data"]["assetId"] == "B17"


def test_prediction_endpoint():
    response = client.post("/api/predictions/B17", headers=auth_headers())
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["assetId"] == "B17"
    assert "riskLevel" in data


def test_risk_endpoint():
    response = client.get("/api/risk/B17", headers=auth_headers())
    assert response.status_code == 200
    assert "riskScore" in response.json()["data"]


def test_simulation():
    response = client.post(
        "/api/simulate",
        headers=auth_headers(),
        json={"assetId": "B17", "repairQuality": 80, "budget": 250000},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["beforeRisk"] >= data["afterRisk"]


def test_optimization():
    response = client.post(
        "/api/optimize",
        headers=auth_headers(),
        json={"budget": 1000000, "strategy": "safety"},
    )
    assert response.status_code == 200
    assert len(response.json()["data"]["priorities"]) > 0


def test_metrics():
    response = client.get("/api/metrics", headers=auth_headers())
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["totalAssets"] >= 58
