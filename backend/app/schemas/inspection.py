from pydantic import BaseModel, Field


class YOLOBoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class YOLODetection(BaseModel):
    damage_type: str
    damage_name: str
    confidence: float
    bbox: YOLOBoundingBox


class YOLOPredictionResponse(BaseModel):
    detections: list[YOLODetection] = Field(default_factory=list)
    image_width: int
    image_height: int


class InspectionLocationInput(BaseModel):
    location_id: str
    name: str
    latitude: float
    longitude: float
    road_name: str
    image_keys: list[str] = Field(default_factory=list)


class AnalyzedImageOut(BaseModel):
    image_key: str
    detections: list[YOLODetection] = Field(default_factory=list)
    image_width: int
    image_height: int


class DamageBreakdown(BaseModel):
    D00: int = 0
    D10: int = 0
    D20: int = 0
    D40: int = 0


class RiskPredictionOut(BaseModel):
    cls: int = Field(..., alias="class")
    label: str
    model: str = "XGBoost"

    model_config = {"populate_by_name": True}


class RiskFeaturesOut(BaseModel):
    d00_count: float
    d10_count: float
    d20_count: float
    d40_count: float
    total_detections: float
    d00_area_ratio: float
    d10_area_ratio: float
    d20_area_ratio: float
    d40_area_ratio: float
    total_damage_area_ratio: float
    avg_bbox_area_ratio: float
    max_bbox_area_ratio: float


class LocationRiskOut(BaseModel):
    damage_score: float
    risk_score: float
    risk_level: str
    detection_count: int
    damage_breakdown: DamageBreakdown
    risk_prediction: RiskPredictionOut
    risk_features: RiskFeaturesOut


class NearbyEntityOut(BaseModel):
    type: str
    name: str
    latitude: float
    longitude: float
    distance_m: float


class ImpactOut(BaseModel):
    nearby_entities: list[NearbyEntityOut] = Field(default_factory=list)
    entity_exposure_score: float
    connectivity_score: float


class PriorityOut(BaseModel):
    priority_score: float
    priority_level: str


class AnalyzedLocationOut(BaseModel):
    rank: int = 1
    location_id: str
    name: str
    latitude: float
    longitude: float
    images_analyzed: int
    images: list[AnalyzedImageOut] = Field(default_factory=list)
    risk: LocationRiskOut
    impact: ImpactOut
    priority: PriorityOut


class InspectionAnalysisDataOut(BaseModel):
    locations: list[AnalyzedLocationOut] = Field(default_factory=list)
