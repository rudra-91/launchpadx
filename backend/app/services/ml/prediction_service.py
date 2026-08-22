from app.core.config import get_settings
from app.schemas.prediction import PredictionOut
from app.services.ml.mock_predictor import MockPredictor
from app.services.ml.model_predictor import ModelPredictor


class PredictionService:
    def __init__(self) -> None:
        settings = get_settings()
        if settings.ml_provider.lower() == "xgboost":
            self._predictor = ModelPredictor()
        else:
            self._predictor = MockPredictor()

    def predict(self, asset_id: str, current_condition: float, age: int, traffic: int) -> PredictionOut:
        return self._predictor.predict(asset_id, current_condition, age, traffic)
