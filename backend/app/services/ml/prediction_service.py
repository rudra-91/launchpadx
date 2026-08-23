from app.core.config import get_settings
from app.schemas.prediction import PredictionOut
from app.services.ml.mock_predictor import MockPredictor
from app.services.ml.model_predictor import ModelPredictor


class PredictionService:
    """Asset-level /api/predictions helper.

    Note: Road inspection YOLO+XGBoost does NOT use ML_PROVIDER.
    ML_PROVIDER only selects the asset condition stub (mock vs optional joblib).
    """

    def __init__(self) -> None:
        settings = get_settings()
        provider = settings.ml_provider.lower().strip()
        if provider in {"xgboost", "model"} and settings.ml_model_path:
            self._predictor = ModelPredictor()
        else:
            # "real" / "mock" / unset → deterministic asset stub (inspection ML is separate)
            self._predictor = MockPredictor()

    def predict(self, asset_id: str, current_condition: float, age: int, traffic: int) -> PredictionOut:
        return self._predictor.predict(asset_id, current_condition, age, traffic)
