def calculate_risk_level(risk_score: float) -> str:
    if risk_score >= 80:
        return "CRITICAL"
    if risk_score >= 60:
        return "HIGH"
    if risk_score >= 35:
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
