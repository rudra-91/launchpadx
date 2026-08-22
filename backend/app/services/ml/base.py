from abc import ABC, abstractmethod

from app.schemas.prediction import FeatureImportanceItem, PredictionOut


class BasePredictor(ABC):
    @abstractmethod
    def predict(self, asset_id: str, current_condition: float, age: int, traffic: int) -> PredictionOut:
        raise NotImplementedError
