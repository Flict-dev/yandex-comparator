from __future__ import annotations

from typing import List, Optional

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


class PlaylistMetaDTO(BaseModel):
    title: str
    owner_login: str
    kind: int
    track_count: int


class MetricsDTO(BaseModel):
    jaccard: float
    overlap: float
    containment_a: float
    containment_b: float


class CountsDTO(BaseModel):
    a: int
    b: int
    intersection: int
    union: int


class ComparisonResultDTO(BaseModel):
    playlist_a: PlaylistMetaDTO
    playlist_b: PlaylistMetaDTO
    counts: CountsDTO
    metrics: MetricsDTO
    common_tracks: List[TrackDTO]
    total_common: int


class CompareRequestDTO(BaseModel):
    playlist_urls: List[str] = Field(min_length=2, max_length=2)
