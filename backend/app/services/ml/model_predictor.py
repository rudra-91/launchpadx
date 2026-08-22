import logging

from app.core.config import get_settings
from app.schemas.prediction import PredictionOut
from app.services.ml.base import BasePredictor
from app.services.ml.mock_predictor import MockPredictor

logger = logging.getLogger(__name__)


class ModelPredictor(BasePredictor):
    """Placeholder for future XGBoost integration.

    The ML team can plug in:
    - .joblib model loading
    - preprocessing artifacts
    - feature definitions
    - SHAP explanation logic
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.model_path = settings.ml_model_path
        self._model = None
        if self.model_path:
            try:
                import joblib  # type: ignore

                self._model = joblib.load(self.model_path)
                logger.info("Loaded ML model from %s", self.model_path)
            except Exception as exc:  # noqa: BLE001
                logger.warning("Could not load ML model: %s. Falling back to mock logic.", exc)

    def predict(self, asset_id: str, current_condition: float, age: int, traffic: int) -> PredictionOut:
        if self._model is None:
            logger.warning("ModelPredictor unavailable — using mock fallback for %s", asset_id)
            return MockPredictor().predict(asset_id, current_condition, age, traffic)

        # Integration point for ML team's prediction function.
        # Do not hard-code NBI feature columns here.
        raise NotImplementedError(
            "Wire the ML team's prediction function in model_predictor.py when artifacts are ready."
        )
