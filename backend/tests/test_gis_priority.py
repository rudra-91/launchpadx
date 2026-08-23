import pytest
from app.services.gis_service import (
    CRITICALITY_WEIGHTS,
    calculate_connectivity_score,
    calculate_entity_exposure_score,
    haversine_distance_m,
)
from app.services.priority_service import (
    XGB_CLASS_SCORE_MAP,
    calculate_priority_score,
)


def test_haversine_distance_calculation():
    """Verify Haversine distance calculation between known coordinates."""
    # Delhi to Gurgaon (~25-30 km)
    dist = haversine_distance_m(28.6139, 77.2090, 28.4595, 77.0266)
    assert 24000 < dist < 30000

    # Same location => 0 meters
    same_dist = haversine_distance_m(28.6139, 77.2090, 28.6139, 77.2090)
    assert same_dist == 0.0


def test_entity_criticality_weights():
    """Verify configured entity criticality weights hierarchy."""
    assert CRITICALITY_WEIGHTS["hospital"] == 1.0
    assert CRITICALITY_WEIGHTS["fire_station"] == 0.9
    assert CRITICALITY_WEIGHTS["police_station"] == 0.8
    assert CRITICALITY_WEIGHTS["school"] == 0.6

    assert (
        CRITICALITY_WEIGHTS["hospital"]
        > CRITICALITY_WEIGHTS["fire_station"]
        > CRITICALITY_WEIGHTS["police_station"]
        > CRITICALITY_WEIGHTS["school"]
    )


def test_entity_exposure_score():
    """Verify distance decay and entity exposure scoring."""
    # Empty entities => 0 score
    assert calculate_entity_exposure_score([]) == 0.0

    # Hospital 100m away vs Hospital 900m away
    close_hospital = [{"type": "hospital", "distance_m": 100.0}]
    far_hospital = [{"type": "hospital", "distance_m": 900.0}]

    close_score = calculate_entity_exposure_score(close_hospital)
    far_score = calculate_entity_exposure_score(far_hospital)

    assert close_score > far_score
    assert close_score == pytest.approx(36.0, 0.1)  # 1.0 * 0.9 * 40 = 36


def test_connectivity_score():
    """Verify road connectivity score calculations and bounds."""
    assert calculate_connectivity_score(0) == 50.0  # Neutral baseline
    assert calculate_connectivity_score(2) == 25.0
    assert calculate_connectivity_score(5) == 62.5
    assert calculate_connectivity_score(10) == 100.0  # Upper bound cap


def test_priority_calculation_formula():
    """Verify exact weighted composition: 50% XGB + 20% Damage + 20% Exposure + 10% Connectivity."""
    # XGB Class 3 (CRITICAL => 90.0), Damage=50.0, Exposure=50.0, Connectivity=50.0
    # Expected = 0.50*90 + 0.20*50 + 0.20*50 + 0.10*50 = 45 + 10 + 10 + 5 = 70.0 (HIGH)
    res = calculate_priority_score(
        xgb_class=3,
        damage_score=50.0,
        entity_exposure_score=50.0,
        connectivity_score=50.0,
    )
    assert res["priority_score"] == 70.0
    assert res["priority_level"] == "HIGH"


def test_priority_thresholds():
    """Verify priority score levels across threshold boundaries."""
    # LOW: 0-29
    low_res = calculate_priority_score(0, damage_score=0.0, entity_exposure_score=0.0, connectivity_score=20.0)
    assert low_res["priority_score"] < 30.0
    assert low_res["priority_level"] == "LOW"

    # MEDIUM: 30-59
    med_res = calculate_priority_score(1, damage_score=30.0, entity_exposure_score=20.0, connectivity_score=50.0)
    assert 30.0 <= med_res["priority_score"] < 60.0
    assert med_res["priority_level"] == "MEDIUM"

    # HIGH: 60-79
    high_res = calculate_priority_score(2, damage_score=60.0, entity_exposure_score=50.0, connectivity_score=60.0)
    assert 60.0 <= high_res["priority_score"] < 80.0
    assert high_res["priority_level"] == "HIGH"

    # CRITICAL: 80-100
    crit_res = calculate_priority_score(3, damage_score=90.0, entity_exposure_score=80.0, connectivity_score=90.0)
    assert crit_res["priority_score"] >= 80.0
    assert crit_res["priority_level"] == "CRITICAL"


def test_multi_location_sorting():
    """Verify multi-location sorting logic ranks locations descending by priority_score."""
    from app.schemas.inspection import (
        AnalyzedLocationOut,
        DamageBreakdown,
        ImpactOut,
        LocationRiskOut,
        PriorityOut,
        RiskFeaturesOut,
        RiskPredictionOut,
    )

    def dummy_loc(loc_id: str, priority_score: float) -> AnalyzedLocationOut:
        return AnalyzedLocationOut(
            rank=1,
            location_id=loc_id,
            name=f"Location {loc_id}",
            latitude=28.0,
            longitude=77.0,
            images_analyzed=1,
            images=[],
            risk=LocationRiskOut(
                damage_score=10.0,
                risk_score=10.0,
                risk_level="LOW",
                detection_count=0,
                damage_breakdown=DamageBreakdown(),
                risk_prediction=RiskPredictionOut(cls=0, label="LOW"),
                risk_features=RiskFeaturesOut(
                    d00_count=0, d10_count=0, d20_count=0, d40_count=0, total_detections=0,
                    d00_area_ratio=0, d10_area_ratio=0, d20_area_ratio=0, d40_area_ratio=0,
                    total_damage_area_ratio=0, avg_bbox_area_ratio=0, max_bbox_area_ratio=0
                ),
            ),
            impact=ImpactOut(nearby_entities=[], entity_exposure_score=0.0, connectivity_score=50.0),
            priority=PriorityOut(priority_score=priority_score, priority_level="LOW"),
        )

    locs = [dummy_loc("loc_low", 25.0), dummy_loc("loc_crit", 88.0), dummy_loc("loc_med", 52.0)]
    locs.sort(key=lambda x: x.priority.priority_score, reverse=True)

    sorted_ids = [l.location_id for l in locs]
    assert sorted_ids == ["loc_crit", "loc_med", "loc_low"]
