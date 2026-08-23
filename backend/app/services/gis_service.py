import asyncio
import logging
import math
from typing import Any
import httpx

logger = logging.getLogger(__name__)

# Configurable Entity Criticality Weights
CRITICALITY_WEIGHTS: dict[str, float] = {
    "hospital": 1.0,
    "fire_station": 0.9,
    "police_station": 0.8,
    "school": 0.6,
}

CATEGORIES = ["hospital", "school", "police", "fire_station"]

# Simple in-memory cache for coordinates: (round_lat, round_lon, radius_m) -> result_dict
_GIS_CACHE: dict[tuple[float, float, int], dict[str, Any]] = {}


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return float(R * c)


def calculate_entity_exposure_score(nearby_entities: list[dict[str, Any]], max_radius_m: float = 2000.0) -> float:
    """Calculate a normalized 0-100 entity exposure score based on proximity and criticality."""
    if not nearby_entities:
        return 0.0

    raw_exposure = 0.0
    for entity in nearby_entities:
        etype = entity.get("type", "other")
        dist = entity.get("distance_m", max_radius_m)
        weight = CRITICALITY_WEIGHTS.get(etype, 0.5)

        if dist < max_radius_m:
            decay_factor = max(0.0, 1.0 - (dist / max_radius_m))
            raw_exposure += weight * decay_factor

    # Scale raw exposure to 0-100 (e.g. 1 critical entity right next to location gives ~40 points)
    return min(100.0, round(raw_exposure * 40.0, 1))


def calculate_connectivity_score(road_count: int) -> float:
    """Calculate a normalized 0-100 road connectivity proxy score."""
    if road_count <= 0:
        return 50.0  # Neutral baseline fallback for locations without explicit OSM road features
    return min(100.0, round(max(20.0, road_count * 12.5), 1))


async def _fetch_nominatim_category(
    client: httpx.AsyncClient,
    lat: float,
    lon: float,
    category: str,
    radius_m: float,
) -> list[dict[str, Any]]:
    """Query OSM Nominatim API for a specific infrastructure entity category around coordinates."""
    delta_deg = (radius_m / 1000.0) * 0.009
    viewbox = f"{lon - delta_deg:.4f},{lat + delta_deg:.4f},{lon + delta_deg:.4f},{lat - delta_deg:.4f}"

    q_term = "police" if category in ("police", "police_station") else category
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={q_term}&bounded=1&viewbox={viewbox}&limit=8"

    try:
        res = await client.get(url, headers={"User-Agent": "LaunchpadX-RoadAI/1.0"})
        if res.status_code == 200:
            items = res.json()
            results: list[dict[str, Any]] = []

            for item in items:
                try:
                    el_lat = float(item["lat"])
                    el_lon = float(item["lon"])
                    dist = haversine_distance_m(lat, lon, el_lat, el_lon)

                    if dist <= radius_m:
                        raw_name = item.get("display_name", "").split(",")[0].strip()
                        norm_type = "police_station" if category in ("police", "police_station") else category
                        fallback_name = f"Unnamed {norm_type.replace('_', ' ').title()}"
                        name = raw_name if raw_name else fallback_name

                        results.append(
                            {
                                "type": norm_type,
                                "name": name,
                                "latitude": round(el_lat, 6),
                                "longitude": round(el_lon, 6),
                                "distance_m": round(dist, 1),
                            }
                        )
                except Exception:
                    continue
            return results
    except Exception as exc:
        logger.warning("Nominatim category query '%s' failed for (%s, %s): %s", category, lat, lon, exc)

    return []


async def _fetch_overpass_entities(
    client: httpx.AsyncClient,
    lat: float,
    lon: float,
    radius_m: float,
) -> tuple[list[dict[str, Any]], int]:
    """Query OpenStreetMap Overpass API for nearby infrastructure nodes/ways/relations and roads."""
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json][timeout:3];
    (
      node["amenity"~"hospital|school|police|fire_station|clinic"](around:{int(radius_m)},{lat},{lon});
      way["amenity"~"hospital|school|police|fire_station|clinic"](around:{int(radius_m)},{lat},{lon});
      way["highway"](around:500,{lat},{lon});
    );
    out center;
    """

    nearby_entities: list[dict[str, Any]] = []
    road_count = 0

    try:
        res = await client.post(overpass_url, data={"data": query})
        if res.status_code == 200:
            data = res.json()
            elements = data.get("elements", [])

            for elem in elements:
                tags = elem.get("tags", {})
                amenity = tags.get("amenity")

                # Handle nodes, ways, and relations via lat/lon or center
                el_lat = elem.get("lat") or elem.get("center", {}).get("lat")
                el_lon = elem.get("lon") or elem.get("center", {}).get("lon")

                if amenity and el_lat is not None and el_lon is not None:
                    if amenity in ("hospital", "clinic"):
                        norm_type = "hospital"
                    elif amenity == "police":
                        norm_type = "police_station"
                    else:
                        norm_type = amenity

                    dist = haversine_distance_m(lat, lon, el_lat, el_lon)
                    if dist <= radius_m:
                        fallback_name = f"Unnamed {norm_type.replace('_', ' ').title()}"
                        name = tags.get("name") or tags.get("name:en") or fallback_name

                        nearby_entities.append(
                            {
                                "type": norm_type,
                                "name": name,
                                "latitude": round(float(el_lat), 6),
                                "longitude": round(float(el_lon), 6),
                                "distance_m": round(dist, 1),
                            }
                        )

                elif "highway" in tags:
                    road_count += 1

    except Exception as exc:
        logger.warning("Overpass query failed for (%s, %s): %s", lat, lon, exc)

    return nearby_entities, road_count


async def fetch_gis_and_impact_data(
    latitude: float,
    longitude: float,
    radius_m: int = 2000,
    timeout_s: float = 4.0,
) -> dict[str, Any]:
    """Fetch nearby amenities and road connectivity from OpenStreetMap with fast multi-query discovery and caching."""
    cache_key = (round(latitude, 4), round(longitude, 4), radius_m)
    if cache_key in _GIS_CACHE:
        logger.info("Retrieved GIS data from cache for key %s", cache_key)
        return _GIS_CACHE[cache_key]

    nearby_entities: list[dict[str, Any]] = []
    seen_names: set[str] = set()
    road_count = 0
    osm_reachable = False

    async with httpx.AsyncClient(timeout=timeout_s) as client:
        # Try Nominatim parallel category query first for fast reliable results
        nom_tasks = [
            _fetch_nominatim_category(client, latitude, longitude, cat, float(radius_m))
            for cat in CATEGORIES
        ]
        nom_results = await asyncio.gather(*nom_tasks, return_exceptions=True)

        for res in nom_results:
            if isinstance(res, list) and res:
                osm_reachable = True
                for ent in res:
                    if ent["name"] not in seen_names:
                        seen_names.add(ent["name"])
                        nearby_entities.append(ent)

        # Also attempt Overpass query to capture road network connectivity count
        try:
            op_entities, op_roads = await _fetch_overpass_entities(client, latitude, longitude, float(radius_m))
            if op_roads > 0:
                road_count = op_roads
            if op_entities:
                osm_reachable = True
                for ent in op_entities:
                    if ent["name"] not in seen_names:
                        seen_names.add(ent["name"])
                        nearby_entities.append(ent)
        except Exception:
            pass

    # Sort nearby entities by distance ascending
    nearby_entities.sort(key=lambda x: x["distance_m"])

    exposure_score = calculate_entity_exposure_score(nearby_entities, max_radius_m=float(radius_m))
    connectivity_score = calculate_connectivity_score(road_count if road_count > 0 else (4 if osm_reachable else 0))

    result = {
        "nearby_entities": nearby_entities,
        "entity_exposure_score": exposure_score,
        "connectivity_score": connectivity_score,
        "osm_reachable": osm_reachable,
    }

    _GIS_CACHE[cache_key] = result
    return result
