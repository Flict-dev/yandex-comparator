from __future__ import annotations

import random
from dataclasses import dataclass
from typing import List, Optional

import httpx

from app.cache import TTLCache
from app.models import TrackDTO
from app.parser import ParsedPlaylistRef


@dataclass(frozen=True)
class PlaylistSnapshot:
    title: str
    tracks: List[TrackDTO]


class ProviderError(RuntimeError):
    pass


class WebHandlerProvider:
    def __init__(self, ttl_seconds: int = 600, timeout_seconds: float = 10.0) -> None:
        self._cache: TTLCache[PlaylistSnapshot] = TTLCache(ttl_seconds=ttl_seconds)
        self._timeout = timeout_seconds

    async def fetch(self, ref: ParsedPlaylistRef) -> PlaylistSnapshot:
        cache_key = f"{ref.owner_login}:{ref.kind}"
        cached = self._cache.get(cache_key)
        if cached:
            return cached
        url = "https://music.yandex.ru/handlers/playlist.jsx"
        params = {"owner": ref.owner_login, "kinds": str(ref.kind), "r": str(random.random())}
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                payload = response.json()
        except httpx.TimeoutException as exc:
            raise ProviderError("Timed out while fetching playlist") from exc
        except httpx.HTTPError as exc:
            raise ProviderError("Failed to fetch playlist") from exc
        except ValueError as exc:
            raise ProviderError("Invalid response payload") from exc
        playlist = payload.get("playlist", payload)
        title = playlist.get("title") or f"Playlist {ref.kind}"
        tracks_data = playlist.get("tracks") or []
        tracks = []
        for item in tracks_data:
            track_id = _to_int(item.get("id"))
            album_id = _extract_album_id(item.get("albums"))
            title_value = item.get("title")
            artists = _extract_artists(item.get("artists"))
            if track_id is None or album_id is None or not title_value:
                continue
            track_key = f"{track_id}:{album_id}"
            track = TrackDTO(
                track_key=track_key,
                track_id=track_id,
                album_id=album_id,
                title=title_value,
                artists=artists,
                duration_ms=_to_int(item.get("durationMs")),
                cover_url=_extract_cover_url(item.get("coverUri")),
                link=item.get("link"),
            )
            tracks.append(track)
        snapshot = PlaylistSnapshot(title=title, tracks=tracks)
        self._cache.set(cache_key, snapshot)
        return snapshot


def _to_int(value: object) -> Optional[int]:
    try:
        if value is None:
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def _extract_album_id(albums: object) -> Optional[int]:
    if not isinstance(albums, list) or not albums:
        return None
    album_id = albums[0].get("id") if isinstance(albums[0], dict) else None
    return _to_int(album_id)


def _extract_artists(artists: object) -> List[str]:
    if not isinstance(artists, list):
        return []
    names = []
    for artist in artists:
        if isinstance(artist, dict) and artist.get("name"):
            names.append(str(artist["name"]))
    return names


def _extract_cover_url(cover_uri: object) -> Optional[str]:
    if not isinstance(cover_uri, str) or not cover_uri:
        return None
    return f"https://{cover_uri.replace('%%', '200x200')}"
