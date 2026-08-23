import json
import logging
from fastapi import UploadFile
import numpy as np
from pydantic import ValidationError

from app.core.responses import AppError
from app.schemas.inspection import (
    AnalyzedImageOut,
    AnalyzedLocationOut,
    DamageBreakdown,
    ImpactOut,
    InspectionAnalysisDataOut,
    InspectionLocationInput,
    LocationRiskOut,
    NearbyEntityOut,
    PriorityOut,
    RiskFeaturesOut,
    RiskPredictionOut,
    YOLODetection,
)
from app.services.gis_service import fetch_gis_and_impact_data
from app.services.priority_service import calculate_priority_score
from app.services.risk_service import calculate_location_risk
from app.services.xgboost_service import predict_road_risk
from app.services import yolo_service

logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB


def validate_and_parse_payload(payload_str: str) -> list[InspectionLocationInput]:
    """Validate JSON string format, array structure, field presence, and lat/long boundaries."""
    if not payload_str or not payload_str.strip():
        raise AppError("INVALID_INPUT", "Payload field is required and cannot be empty", status_code=400)

    try:
        raw_data = json.loads(payload_str)
    except Exception as exc:
        raise AppError("INVALID_INPUT", f"Payload must be valid JSON: {exc}", status_code=400) from exc

    if not isinstance(raw_data, list):
        raise AppError("INVALID_INPUT", "Payload JSON must be an array of locations", status_code=400)

    if not raw_data:
        raise AppError("INVALID_INPUT", "Payload array cannot be empty", status_code=400)

    parsed_locations: list[InspectionLocationInput] = []
    for idx, item in enumerate(raw_data):
        if not isinstance(item, dict):
            raise AppError("INVALID_INPUT", f"Location at index {idx} must be an object", status_code=400)

        for required_key in ("location_id", "latitude", "longitude", "image_keys"):
            if required_key not in item:
                raise AppError(
                    "INVALID_INPUT",
                    f"Location at index {idx} missing required field '{required_key}'",
                    status_code=400,
                )

        try:
            loc = InspectionLocationInput.model_validate(item)
        except ValidationError as exc:
            raise AppError(
                "INVALID_INPUT",
                f"Validation error for location at index {idx}: {exc}",
                status_code=400,
            ) from exc

        if not (-90.0 <= loc.latitude <= 90.0):
            raise AppError(
                "INVALID_INPUT",
                f"Latitude {loc.latitude} for location '{loc.location_id}' out of range [-90, 90]",
                status_code=400,
            )
        if not (-180.0 <= loc.longitude <= 180.0):
            raise AppError(
                "INVALID_INPUT",
                f"Longitude {loc.longitude} for location '{loc.location_id}' out of range [-180, 180]",
                status_code=400,
            )

        parsed_locations.append(loc)

    return parsed_locations


def validate_uploaded_images(
    images: list[UploadFile],
    locations: list[InspectionLocationInput],
) -> dict[str, UploadFile]:
    """Map image_keys to uploaded files, verifying file presence, extension, and content type."""
    if not images:
        raise AppError("INVALID_INPUT", "At least one image file must be uploaded", status_code=400)

    file_map: dict[str, UploadFile] = {}
    for file in images:
        filename = file.filename or ""
        if not filename:
            raise AppError("INVALID_INPUT", "Uploaded file missing filename", status_code=400)

        ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
        content_type = (file.content_type or "").lower()
        if content_type not in ALLOWED_CONTENT_TYPES and ext not in ALLOWED_EXTENSIONS:
            raise AppError(
                "INVALID_INPUT",
                f"Unsupported image file format for '{filename}'. Allowed formats: JPG, JPEG, PNG, WEBP",
                status_code=400,
            )

        file_map[filename] = file
        if ext:
            stem = filename.rsplit(".", 1)[0]
            if stem not in file_map:
                file_map[stem] = file

    missing_keys: list[str] = []
    resolved_image_map: dict[str, UploadFile] = {}

    for loc in locations:
        for key in loc.image_keys:
            if key in file_map:
                resolved_image_map[key] = file_map[key]
            else:
                missing_keys.append(key)

    if missing_keys:
        raise AppError(
            "INVALID_INPUT",
            f"Referenced image_keys not found in uploaded files: {', '.join(missing_keys)}",
            status_code=400,
        )

    return resolved_image_map


def extract_location_features(analyzed_images: list[AnalyzedImageOut]) -> dict[str, float]:
    """Extract the exact 12 tabular features required by the XGBoost road risk classifier."""
    d00_c = d10_c = d20_c = d40_c = 0
    d00_a = d10_a = d20_a = d40_a = 0.0
    all_bbox_areas: list[float] = []

    for img in analyzed_images:
        w_img = max(1, img.image_width)
        h_img = max(1, img.image_height)

        for det in img.detections:
            dtype = det.damage_type
            bbox = det.bbox

            w_box = abs(bbox.x2 - bbox.x1)
            h_box = abs(bbox.y2 - bbox.y1)

            # Standardize coordinates: if pixel values (>1.0), normalize relative to image width/height
            if bbox.x2 > 1.0 or bbox.y2 > 1.0 or w_box > 1.0 or h_box > 1.0:
                norm_w = w_box / w_img
                norm_h = h_box / h_img
            else:
                norm_w = w_box
                norm_h = h_box

            area_ratio = float(norm_w * norm_h)
            all_bbox_areas.append(area_ratio)

            if dtype == "D00":
                d00_c += 1
                d00_a += area_ratio
            elif dtype == "D10":
                d10_c += 1
                d10_a += area_ratio
            elif dtype == "D20":
                d20_c += 1
                d20_a += area_ratio
            elif dtype == "D40":
                d40_c += 1
                d40_a += area_ratio

    total_c = d00_c + d10_c + d20_c + d40_c
    total_a = d00_a + d10_a + d20_a + d40_a
    avg_a = float(np.mean(all_bbox_areas)) if all_bbox_areas else 0.0
    max_a = float(np.max(all_bbox_areas)) if all_bbox_areas else 0.0

    return {
        "d00_count": float(d00_c),
        "d10_count": float(d10_c),
        "d20_count": float(d20_c),
        "d40_count": float(d40_c),
        "total_detections": float(total_c),
        "d00_area_ratio": round(d00_a, 6),
        "d10_area_ratio": round(d10_a, 6),
        "d20_area_ratio": round(d20_a, 6),
        "d40_area_ratio": round(d40_a, 6),
        "total_damage_area_ratio": round(total_a, 6),
        "avg_bbox_area_ratio": round(avg_a, 6),
        "max_bbox_area_ratio": round(max_a, 6),
    }


async def analyze_inspections(
    locations: list[InspectionLocationInput],
    image_map: dict[str, UploadFile],
    *,
    predict_fn=None,
) -> InspectionAnalysisDataOut:
    """Orchestrate YOLO (in-process) → features → XGBoost → GIS → priority ranking."""
    run_yolo = predict_fn or yolo_service.predict_image
    unranked_locations: list[AnalyzedLocationOut] = []

    for loc in locations:
        analyzed_images: list[AnalyzedImageOut] = []
        all_location_detections: list[YOLODetection] = []

        for key in loc.image_keys:
            upload_file = image_map[key]
            file_bytes = await upload_file.read()

            if len(file_bytes) > MAX_FILE_SIZE_BYTES:
                raise AppError(
                    "INVALID_INPUT",
                    f"Image '{key}' exceeds maximum allowed size of 15MB",
                    status_code=400,
                )

            filename = upload_file.filename or f"{key}.jpg"
            content_type = upload_file.content_type or "image/jpeg"

            prediction = await run_yolo(
                file_bytes=file_bytes,
                filename=filename,
                content_type=content_type,
            )

            analyzed_images.append(
                AnalyzedImageOut(
                    image_key=key,
                    detections=prediction.detections,
                    image_width=prediction.image_width,
                    image_height=prediction.image_height,
                )
            )
            all_location_detections.extend(prediction.detections)

        # 1. Calculate deterministic damage score & risk level
        risk_data = calculate_location_risk(all_location_detections)

        # 2. Extract exact 12 tabular features for XGBoost model
        features = extract_location_features(analyzed_images)

        # 3. Predict road risk class using XGBoost model
        xgb_pred = predict_road_risk(features)

        location_risk = LocationRiskOut(
            damage_score=risk_data["damage_score"],
            risk_score=risk_data["risk_score"],
            risk_level=risk_data["risk_level"],
            detection_count=risk_data["detection_count"],
            damage_breakdown=DamageBreakdown(**risk_data["damage_breakdown"]),
            risk_prediction=RiskPredictionOut(**xgb_pred),
            risk_features=RiskFeaturesOut(**features),
        )

        # 4. Fetch GIS infrastructure & road impact data
        gis_data = await fetch_gis_and_impact_data(loc.latitude, loc.longitude)

        nearby_entities_out = [
            NearbyEntityOut(**item) for item in gis_data.get("nearby_entities", [])
        ]
        impact_out = ImpactOut(
            nearby_entities=nearby_entities_out,
            entity_exposure_score=gis_data["entity_exposure_score"],
            connectivity_score=gis_data["connectivity_score"],
        )

        # 5. Calculate composite priority score & level
        priority_data = calculate_priority_score(
            xgb_class=xgb_pred["class"],
            damage_score=risk_data["damage_score"],
            entity_exposure_score=gis_data["entity_exposure_score"],
            connectivity_score=gis_data["connectivity_score"],
        )
        priority_out = PriorityOut(**priority_data)

        unranked_locations.append(
            AnalyzedLocationOut(
                rank=1,
                location_id=loc.location_id,
                name=loc.name,
                road_name=loc.road_name,
                latitude=loc.latitude,
                longitude=loc.longitude,
                images_analyzed=len(analyzed_images),
                images=analyzed_images,
                risk=location_risk,
                impact=impact_out,
                priority=priority_out,
            )
        )

    # 6. Multi-location ranking: Sort locations by priority_score DESCENDING and assign 1-indexed rank
    unranked_locations.sort(key=lambda item: item.priority.priority_score, reverse=True)

    ranked_locations: list[AnalyzedLocationOut] = []
    for idx, item in enumerate(unranked_locations, start=1):
        item_dict = item.model_dump(by_alias=True)
        item_dict["rank"] = idx
        ranked_locations.append(AnalyzedLocationOut.model_validate(item_dict))

    return InspectionAnalysisDataOut(locations=ranked_locations)
