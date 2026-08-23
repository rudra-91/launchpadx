from typing import Any

# Configurable weights per damage class for inspection damage scoring
DEFAULT_DAMAGE_WEIGHTS: dict[str, float] = {
    "D00": 5.0,   # Longitudinal Crack
    "D10": 10.0,  # Transverse Crack
    "D20": 20.0,  # Alligator Crack
    "D40": 30.0,  # Pothole
}


def calculate_risk_level(risk_score: float) -> str:
    """Legacy risk level classifier for assets."""
    if risk_score >= 80:
        return "CRITICAL"
    if risk_score >= 60:
        return "HIGH"
    if risk_score >= 35:
        return "MEDIUM"
    return "LOW"


def calculate_inspection_risk_level(risk_score: float) -> str:
    """Inspection risk level classifier using exact hackathon thresholds:
    0-29: LOW
    30-59: MEDIUM
    60-79: HIGH
    80-100: CRITICAL
    """
    if risk_score >= 80.0:
        return "CRITICAL"
    if risk_score >= 60.0:
        return "HIGH"
    if risk_score >= 30.0:
        return "MEDIUM"
    return "LOW"


def calculate_risk_score(
    current_condition: float,
    predicted_condition: float,
    deterioration: float,
    age: int,
    traffic: int,
) -> float:
    """Application-defined decision-support score — not collapse probability."""
    condition_factor = (100 - current_condition) * 0.35
    predicted_factor = (100 - predicted_condition) * 0.25
    deterioration_factor = deterioration * 2.2
    age_factor = min(age, 80) * 0.25
    traffic_factor = min(traffic / 1000, 60) * 0.15
    score = condition_factor + predicted_factor + deterioration_factor + age_factor + traffic_factor
    return max(0.0, min(100.0, score))


def calculate_location_risk(
    detections: list[Any],
    custom_weights: dict[str, float] | None = None,
) -> dict[str, Any]:
    """Calculate deterministic damage score, risk score, risk level, and damage breakdown for a location.

    Formula:
      raw_damage_sum = sum(weight(damage_type) * confidence for each detection)
      damage_score = min(100.0, round(raw_damage_sum, 1))
      risk_score = damage_score (equal for Step 3 until GIS/entity exposure step)
      risk_level = LOW (0-29) | MEDIUM (30-59) | HIGH (60-79) | CRITICAL (80-100)
    """
    weights = custom_weights or DEFAULT_DAMAGE_WEIGHTS

    breakdown = {"D00": 0, "D10": 0, "D20": 0, "D40": 0}
    raw_damage_sum = 0.0
    detection_count = len(detections)

    for det in detections:
        if hasattr(det, "damage_type"):
            dtype = getattr(det, "damage_type")
            conf = float(getattr(det, "confidence", 1.0))
        elif isinstance(det, dict):
            dtype = det.get("damage_type", "")
            conf = float(det.get("confidence", 1.0))
        else:
            continue

        if dtype in breakdown:
            breakdown[dtype] += 1

        w = weights.get(dtype, 5.0)
        raw_damage_sum += w * conf

    damage_score = round(max(0.0, min(100.0, raw_damage_sum)), 1)
    risk_score = damage_score
    risk_level = calculate_inspection_risk_level(risk_score)

    return {
        "damage_score": damage_score,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "detection_count": detection_count,
        "damage_breakdown": breakdown,
    }
