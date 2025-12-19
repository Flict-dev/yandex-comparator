from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Generic, Optional, TypeVar

T = TypeVar("T")


@dataclass
class CacheEntry(Generic[T]):
    value: T
    expires_at: float


class TTLCache(Generic[T]):
    def __init__(self, ttl_seconds: int) -> None:
        self._ttl_seconds = ttl_seconds
        self._data: dict[str, CacheEntry[T]] = {}

    def get(self, key: str) -> Optional[T]:
        entry = self._data.get(key)
        if not entry:
            return None
        if entry.expires_at < time.time():
            self._data.pop(key, None)
            return None
        return entry.value

    def set(self, key: str, value: T) -> None:
        self._data[key] = CacheEntry(value=value, expires_at=time.time() + self._ttl_seconds)
