from __future__ import annotations

from collections import OrderedDict
from typing import Iterable, Tuple

from app.models import ComparisonResultDTO, CountsDTO, MetricsDTO, PlaylistMetaDTO, TrackDTO
from app.parser import ParsedPlaylistRef
from app.providers.web_handler import PlaylistSnapshot


class SimilarityService:
    def compare(
        self,
        ref_a: ParsedPlaylistRef,
        ref_b: ParsedPlaylistRef,
        snapshot_a: PlaylistSnapshot,
        snapshot_b: PlaylistSnapshot,
        limit: int = 500,
    ) -> ComparisonResultDTO:
        tracks_a = _unique_tracks(snapshot_a.tracks)
        tracks_b = _unique_tracks(snapshot_b.tracks)
        keys_a = set(tracks_a.keys())
        keys_b = set(tracks_b.keys())
        intersection_keys = keys_a & keys_b
        union_keys = keys_a | keys_b
        counts = CountsDTO(
            a=len(keys_a),
            b=len(keys_b),
            intersection=len(intersection_keys),
            union=len(union_keys),
        )
        metrics = MetricsDTO(
            jaccard=_safe_div(counts.intersection, counts.union),
            overlap=_safe_div(counts.intersection, min(counts.a, counts.b)),
            containment_a=_safe_div(counts.intersection, counts.a),
            containment_b=_safe_div(counts.intersection, counts.b),
        )
        common_tracks = [tracks_a[key] for key in intersection_keys if key in tracks_a]
        common_tracks = sorted(common_tracks, key=_sort_key)
        total_common = len(common_tracks)
        common_tracks = common_tracks[:limit]
        playlist_a = PlaylistMetaDTO(
            title=snapshot_a.title,
            owner_login=ref_a.owner_login,
            kind=ref_a.kind,
            track_count=counts.a,
        )
        playlist_b = PlaylistMetaDTO(
            title=snapshot_b.title,
            owner_login=ref_b.owner_login,
            kind=ref_b.kind,
            track_count=counts.b,
        )
        return ComparisonResultDTO(
            playlist_a=playlist_a,
            playlist_b=playlist_b,
            counts=counts,
            metrics=metrics,
            common_tracks=common_tracks,
            total_common=total_common,
        )


def _unique_tracks(tracks: Iterable[TrackDTO]) -> "OrderedDict[str, TrackDTO]":
    unique: "OrderedDict[str, TrackDTO]" = OrderedDict()
    for track in tracks:
        unique.setdefault(track.track_key, track)
    return unique


def _safe_div(numerator: int, denominator: int) -> float:
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 6)


def _sort_key(track: TrackDTO) -> Tuple[str, str]:
    artist = track.artists[0] if track.artists else ""
    return (artist.lower(), track.title.lower())
