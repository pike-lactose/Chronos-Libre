import time
from typing import Any

_cache: dict[str, dict[str, Any]] = {}


def get(key: str) -> Any | None:
    entry = _cache.get(key)
    if entry and entry["expires_at"] > time.time():
        return entry["data"]
    if entry:
        del _cache[key]
    return None


def set(key: str, data: Any, ttl: int = 300) -> None:
    _cache[key] = {
        "data": data,
        "expires_at": time.time() + ttl,
    }


def make_key(*parts: str) -> str:
    return "|".join(parts)
