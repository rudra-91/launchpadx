import pytest
from app.schemas.inspection import YOLOBoundingBox, YOLODetection
from app.services.risk_service import (
    DEFAULT_DAMAGE_WEIGHTS,
    calculate_inspection_risk_level,
    calculate_location_risk,
)


def make_detection(damage_type: str, confidence: float) -> YOLODetection:
    return YOLODetection(
        damage_type=damage_type,
        damage_name=f"Test {damage_type}",
        confidence=confidence,
        bbox=YOLOBoundingBox(x1=0.0, y1=0.0, x2=10.0, y2=10.0),
    )


def test_calculate_inspection_risk_level_thresholds():
    assert calculate_inspection_risk_level(0.0) == "LOW"
    assert calculate_inspection_risk_level(29.9) == "LOW"
    assert calculate_inspection_risk_level(30.0) == "MEDIUM"
    assert calculate_inspection_risk_level(59.9) == "MEDIUM"
    assert calculate_inspection_risk_level(60.0) == "HIGH"
    assert calculate_inspection_risk_level(79.9) == "HIGH"
    assert calculate_inspection_risk_level(80.0) == "CRITICAL"
    assert calculate_inspection_risk_level(100.0) == "CRITICAL"


def test_calculate_location_risk_empty_detections():
    res = calculate_location_risk([])
    assert res["damage_score"] == 0.0
    assert res["risk_score"] == 0.0
    assert res["risk_level"] == "LOW"
    assert res["detection_count"] == 0
    assert res["damage_breakdown"] == {"D00": 0, "D10": 0, "D20": 0, "D40": 0}


def test_calculate_location_risk_single_pothole():
    det = make_detection("D40", 1.0)
    res = calculate_location_risk([det])
    # D40 weight = 30.0 * 1.0 = 30.0
    assert res["damage_score"] == 30.0
    assert res["risk_score"] == 30.0
    assert res["risk_level"] == "MEDIUM"
    assert res["detection_count"] == 1
    assert res["damage_breakdown"]["D40"] == 1


def test_calculate_location_risk_multiple_detections():
    detections = [
        make_detection("D00", 0.8),  # 5.0 * 0.8 = 4.0
        make_detection("D10", 0.9),  # 10.0 * 0.9 = 9.0
        make_detection("D20", 0.85), # 20.0 * 0.85 = 17.0
        make_detection("D40", 0.95), # 30.0 * 0.95 = 28.5
    ]
    # Sum = 4.0 + 9.0 + 17.0 + 28.5 = 58.5
    res = calculate_location_risk(detections)
    assert res["damage_score"] == 58.5
    assert res["risk_score"] == 58.5
    assert res["risk_level"] == "MEDIUM"
    assert res["detection_count"] == 4
    assert res["damage_breakdown"] == {"D00": 1, "D10": 1, "D20": 1, "D40": 1}


def test_calculate_location_risk_critical_saturation():
    detections = [
        make_detection("D40", 1.0), # 30
        make_detection("D40", 1.0), # 30
        make_detection("D40", 1.0), # 30
        make_detection("D20", 1.0), # 20
    ]
    # Sum = 110.0, capped at 100.0
    res = calculate_location_risk(detections)
    assert res["damage_score"] == 100.0
    assert res["risk_score"] == 100.0
    assert res["risk_level"] == "CRITICAL"
    assert res["detection_count"] == 4
    assert res["damage_breakdown"]["D40"] == 3
    assert res["damage_breakdown"]["D20"] == 1


def test_custom_damage_weights():
    custom_weights = {"D00": 10.0, "D10": 20.0, "D20": 30.0, "D40": 40.0}
    det = make_detection("D40", 1.0)
    res = calculate_location_risk([det], custom_weights=custom_weights)
    assert res["damage_score"] == 40.0
