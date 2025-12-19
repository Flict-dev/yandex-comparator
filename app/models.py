from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TrackDTO(BaseModel):
    track_key: str
    track_id: int
    album_id: int
    title: str
    artists: List[str]
    duration_ms: Optional[int] = None
    cover_url: Optional[str] = None
    link: Optional[str] = None


class PlaylistDTO(BaseModel):
    id: str
    title: str
    owner: str
    count: int


class ComparisonResultDTO(BaseModel):
    playlists: List[PlaylistDTO]
    track_keys_by_playlist: List[List[str]]
    tracks_index: Dict[str, TrackDTO]


class CompareRequestDTO(BaseModel):
    playlist_urls: List[str] = Field(min_length=2, max_length=20)
