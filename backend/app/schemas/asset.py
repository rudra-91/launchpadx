def asset_to_dict(asset: dict) -> dict:
    return {
        "id": asset["asset_id"],
        "assetId": asset["asset_id"],
        "name": asset["name"],
        "type": asset["type"],
        "latitude": asset["latitude"],
        "longitude": asset["longitude"],
        "condition": asset["condition"],
        "predictedCondition": asset["predicted_condition"],
        "riskScore": asset["risk_score"],
        "confidence": asset["confidence"],
        "traffic": asset["traffic"],
        "age": asset["age"],
        "material": asset["material"],
        "status": asset["status"],
    }
