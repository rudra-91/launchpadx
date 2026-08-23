from fastapi import APIRouter, File, Form, UploadFile

from app.core.responses import success_response
from app.services.inspection_service import (
    analyze_inspections,
    validate_and_parse_payload,
    validate_uploaded_images,
)

router = APIRouter(prefix="/api/inspections", tags=["inspections"])


@router.post(
    "/analyze",
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "required": ["payload", "images"],
                        "properties": {
                            "payload": {
                                "type": "string",
                                "title": "Payload",
                                "description": "JSON string containing array of inspection locations",
                            },
                            "images": {
                                "type": "array",
                                "title": "Images",
                                "description": "Uploaded image files matching location image_keys",
                                "items": {
                                    "type": "string",
                                    "format": "binary",
                                },
                            },
                        },
                    }
                }
            }
        }
    },
)
async def analyze_inspections_endpoint(
    payload: str = Form(..., description="JSON string containing array of inspection locations"),
    images: list[UploadFile] = File(..., description="Uploaded image files matching location image_keys"),
):
    """Receive multi-location inspection data and images, query YOLO for damage detections, and return grouped results."""
    locations = validate_and_parse_payload(payload)
    image_map = validate_uploaded_images(images, locations)
    result = await analyze_inspections(locations, image_map)
    return success_response(result.model_dump(by_alias=True))

