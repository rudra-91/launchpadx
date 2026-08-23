import pytest
from app.schemas.inspection import AnalyzedImageOut, YOLOBoundingBox, YOLODetection
from app.services.inspection_service import extract_location_features
from app.services.xgboost_service import predict_road_risk


def test_feature_extraction_empty():
    """Verify feature extraction with zero detections."""
    analyzed_images = [
        AnalyzedImageOut(
            image_key="img_01",
            detections=[],
            image_width=640,
            image_height=640,
        )
    ]
    features = extract_location_features(analyzed_images)

    assert features["d00_count"] == 0.0
    assert features["d10_count"] == 0.0
    assert features["d20_count"] == 0.0
    assert features["d40_count"] == 0.0
    assert features["total_detections"] == 0.0
    assert features["total_damage_area_ratio"] == 0.0
    assert features["avg_bbox_area_ratio"] == 0.0
    assert features["max_bbox_area_ratio"] == 0.0


def test_feature_extraction_d00_only():
    """Verify feature extraction with D00 (longitudinal crack) detections only."""
    detections = [
        YOLODetection(
            damage_type="D00",
            damage_name="Longitudinal Crack",
            confidence=0.85,
            bbox=YOLOBoundingBox(x1=0.1, y1=0.1, x2=0.3, y2=0.5),  # w=0.2, h=0.4 => area=0.08
        )
    ]
    analyzed_images = [
        AnalyzedImageOut(
            image_key="img_d00",
            detections=detections,
            image_width=1000,
            image_height=1000,
        )
    ]
    features = extract_location_features(analyzed_images)

    assert features["d00_count"] == 1.0
    assert features["d10_count"] == 0.0
    assert features["d20_count"] == 0.0
    assert features["d40_count"] == 0.0
    assert features["total_detections"] == 1.0
    assert pytest.approx(features["d00_area_ratio"], 0.0001) == 0.08
    assert pytest.approx(features["total_damage_area_ratio"], 0.0001) == 0.08


def test_feature_extraction_d40_only():
    """Verify feature extraction with D40 (pothole) detections only."""
    detections = [
        YOLODetection(
            damage_type="D40",
            damage_name="Pothole",
            confidence=0.92,
            bbox=YOLOBoundingBox(x1=100, y1=100, x2=300, y2=300),  # 200x200 in 1000x1000 => norm w=0.2, h=0.2 => area=0.04
        )
    ]
    analyzed_images = [
        AnalyzedImageOut(
            image_key="img_d40",
            detections=detections,
            image_width=1000,
            image_height=1000,
        )
    ]
    features = extract_location_features(analyzed_images)

    assert features["d40_count"] == 1.0
    assert features["total_detections"] == 1.0
    assert pytest.approx(features["d40_area_ratio"], 0.0001) == 0.04
    assert pytest.approx(features["total_damage_area_ratio"], 0.0001) == 0.04


def test_feature_extraction_mixed():
    """Verify feature extraction with mixed damage types across multiple images."""
    img1_detections = [
        YOLODetection(
            damage_type="D00",
            damage_name="Longitudinal Crack",
            confidence=0.8,
            bbox=YOLOBoundingBox(x1=0.0, y1=0.0, x2=0.1, y2=0.1),  # area=0.01
        ),
        YOLODetection(
            damage_type="D10",
            damage_name="Transverse Crack",
            confidence=0.75,
            bbox=YOLOBoundingBox(x1=0.0, y1=0.0, x2=0.2, y2=0.1),  # area=0.02
        ),
    ]
    img2_detections = [
        YOLODetection(
            damage_type="D20",
            damage_name="Alligator Crack",
            confidence=0.9,
            bbox=YOLOBoundingBox(x1=0.0, y1=0.0, x2=0.3, y2=0.1),  # area=0.03
        ),
        YOLODetection(
            damage_type="D40",
            damage_name="Pothole",
            confidence=0.95,
            bbox=YOLOBoundingBox(x1=0.0, y1=0.0, x2=0.2, y2=0.2),  # area=0.04
        ),
    ]

    analyzed_images = [
        AnalyzedImageOut(image_key="k1", detections=img1_detections, image_width=640, image_height=640),
        AnalyzedImageOut(image_key="k2", detections=img2_detections, image_width=640, image_height=640),
    ]

    features = extract_location_features(analyzed_images)

    assert features["d00_count"] == 1.0
    assert features["d10_count"] == 1.0
    assert features["d20_count"] == 1.0
    assert features["d40_count"] == 1.0
    assert features["total_detections"] == 4.0
    assert pytest.approx(features["total_damage_area_ratio"], 0.0001) == 0.10
    assert pytest.approx(features["avg_bbox_area_ratio"], 0.0001) == 0.025
    assert pytest.approx(features["max_bbox_area_ratio"], 0.0001) == 0.04


def test_xgboost_prediction():
    """Verify XGBoost prediction output structure and values for Low vs Critical risk features."""
    low_risk_features = {
        "d00_count": 0.0, "d10_count": 0.0, "d20_count": 0.0, "d40_count": 0.0, "total_detections": 0.0,
        "d00_area_ratio": 0.0, "d10_area_ratio": 0.0, "d20_area_ratio": 0.0, "d40_area_ratio": 0.0,
        "total_damage_area_ratio": 0.0, "avg_bbox_area_ratio": 0.0, "max_bbox_area_ratio": 0.0,
    }
    low_res = predict_road_risk(low_risk_features)
    assert low_res["class"] == 0
    assert low_res["label"] == "LOW"
    assert "XGBoost" in low_res["model"]

    high_risk_features = {
        "d00_count": 2.0, "d10_count": 2.0, "d20_count": 3.0, "d40_count": 4.0, "total_detections": 11.0,
        "d00_area_ratio": 0.1, "d10_area_ratio": 0.1, "d20_area_ratio": 0.2, "d40_area_ratio": 0.3,
        "total_damage_area_ratio": 0.7, "avg_bbox_area_ratio": 0.063, "max_bbox_area_ratio": 0.15,
    }
    high_res = predict_road_risk(high_risk_features)
    assert high_res["class"] == 3
    assert high_res["label"] == "CRITICAL"
    assert "XGBoost" in high_res["model"]
