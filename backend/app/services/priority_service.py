import logging
from typing import Any

logger = logging.getLogger(__name__)

# Map XGBoost predicted class index (0-3) to a 0-100 normalized risk score
XGB_CLASS_SCORE_MAP: dict[int, float] = {
    0: 15.0,  # LOW
    1: 45.0,  # MEDIUM
    2: 70.0,  # HIGH
    3: 90.0,  # CRITICAL
}


def calculate_priority_score(
    xgb_class: int,
    damage_score: float,
    entity_exposure_score: float,
    connectivity_score: float,
) -> dict[str, Any]:
    """Calculate composite location priority score and priority level.
    
    Formula:
      priority_score = 0.50 * xgb_risk_score + 0.20 * damage_score + 0.20 * entity_exposure_score + 0.10 * connectivity_score
      
    Priority Levels:
      0  - 29 : LOW
      30 - 59 : MEDIUM
      60 - 79 : HIGH
      80 - 100: CRITICAL
    """
    xgb_risk_score = XGB_CLASS_SCORE_MAP.get(xgb_class, 15.0)

    # Normalize inputs to 0-100 bounds
    d_score = min(100.0, max(0.0, float(damage_score)))
    exp_score = min(100.0, max(0.0, float(entity_exposure_score)))
    conn_score = min(100.0, max(0.0, float(connectivity_score)))

    # Weighted composition
    raw_priority = (
        0.50 * xgb_risk_score
        + 0.20 * d_score
        + 0.20 * exp_score
        + 0.10 * conn_score
    )

    priority_score = min(100.0, max(0.0, round(raw_priority, 1)))

    if priority_score < 30.0:
        priority_level = "LOW"
    elif priority_score < 60.0:
        priority_level = "MEDIUM"
    elif priority_score < 80.0:
        priority_level = "HIGH"
    else:
        priority_level = "CRITICAL"

    return {
        "priority_score": priority_score,
        "priority_level": priority_level,
    }
