import logging
from typing import Any

import httpx
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.responses import AppError
from app.schemas.inspection import YOLOPredictionResponse

logger = logging.getLogger(__name__)


class YOLOClient:
    """Async HTTP client for interacting with the external YOLO ML FastAPI service."""

    def __init__(self, base_url: str | None = None, timeout: float = 30.0) -> None:
        settings = get_settings()
        self.base_url = (base_url or settings.yolo_service_url).rstrip("/")
        self.timeout = timeout

    async def predict_image(
        self,
        file_bytes: bytes,
        filename: str = "image.jpg",
        content_type: str = "image/jpeg",
        confidence: float = 0.25,
    ) -> YOLOPredictionResponse:
        """Send an image to the YOLO ML service POST /predict endpoint and return parsed detections."""
        url = f"{self.base_url}/predict"
        params = {"conf": confidence}
        files = {"image": (filename, file_bytes, content_type)}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, params=params, files=files)
                response.raise_for_status()
                data: dict[str, Any] = response.json()
                return YOLOPredictionResponse.model_validate(data)
        except httpx.ConnectError as exc:
            logger.error("Failed to connect to YOLO service at %s: %s", url, exc)
            raise AppError(
                "YOLO_CONNECTION_ERROR",
                f"Could not connect to YOLO ML service at {self.base_url}",
                status_code=503,
            ) from exc
        except httpx.TimeoutException as exc:
            logger.error("YOLO service timed out at %s: %s", url, exc)
            raise AppError(
                "YOLO_TIMEOUT",
                f"YOLO ML service at {self.base_url} timed out",
                status_code=504,
            ) from exc
        except httpx.HTTPStatusError as exc:
            logger.error("YOLO service returned HTTP error %s: %s", exc.response.status_code, exc.response.text)
            raise AppError(
                "YOLO_HTTP_ERROR",
                f"YOLO ML service error ({exc.response.status_code}): {exc.response.text}",
                status_code=502,
            ) from exc
        except (ValidationError, ValueError) as exc:
            logger.error("Failed to parse YOLO response: %s", exc)
            raise AppError(
                "YOLO_PARSE_ERROR",
                f"Invalid response format from YOLO ML service: {exc}",
                status_code=502,
            ) from exc

    async def check_health(self) -> bool:
        """Check if the external YOLO service is reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                if response.status_code == 200:
                    return True
                # Fallback to GET / if /health is not defined
                response = await client.get(f"{self.base_url}/")
                return response.status_code in (200, 404, 405)
        except Exception:
            return False


async def predict_image(
    file_bytes: bytes,
    filename: str = "image.jpg",
    content_type: str = "image/jpeg",
    confidence: float = 0.25,
) -> YOLOPredictionResponse:
    """Module-level async function to query the default YOLO ML service."""
    client = YOLOClient()
    return await client.predict_image(
        file_bytes=file_bytes,
        filename=filename,
        content_type=content_type,
        confidence=confidence,
    )
