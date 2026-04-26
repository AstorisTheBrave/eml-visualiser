import hashlib
import json
import threading

_cache: dict[str, dict] = {}
_cache_lock = threading.Lock()
MAX_CACHE_SIZE = 500


def cache_key(expression: str, variables: dict, mode: str) -> str:
    payload = json.dumps(
        {"expr": expression, "vars": variables, "mode": mode},
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode()).hexdigest()


def get_cached(key: str) -> dict | None:
    with _cache_lock:
        return _cache.get(key)


def set_cached(key: str, value: dict) -> None:
    with _cache_lock:
        if len(_cache) >= MAX_CACHE_SIZE:
            oldest = next(iter(_cache))
            del _cache[oldest]
        _cache[key] = value
