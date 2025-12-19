from __future__ import annotations

from collections import OrderedDict
from typing import Iterable, List

from app.models import ComparisonResultDTO, PlaylistDTO, TrackDTO
from app.parser import ParsedPlaylistRef
from app.providers.web_handler import PlaylistSnapshot


class SimilarityService:
    def compare(
        self,
        refs: List[ParsedPlaylistRef],
        snapshots: List[PlaylistSnapshot],
    ) -> ComparisonResultDTO:
        playlists: List[PlaylistDTO] = []
        track_keys_by_playlist: List[List[str]] = []
        tracks_index: "OrderedDict[str, TrackDTO]" = OrderedDict()
        for index, (ref, snapshot) in enumerate(zip(refs, snapshots)):
            unique_tracks = _unique_tracks(snapshot.tracks)
            keys = list(unique_tracks.keys())
            track_keys_by_playlist.append(keys)
            for track_key, track in unique_tracks.items():
                tracks_index.setdefault(track_key, track)
            playlists.append(
                PlaylistDTO(
                    id=f"p{index}",
                    title=snapshot.title,
                    owner=ref.owner_login,
                    count=len(keys),
                )
            )
        return ComparisonResultDTO(
            playlists=playlists,
            track_keys_by_playlist=track_keys_by_playlist,
            tracks_index=tracks_index,
        )


def _unique_tracks(tracks: Iterable[TrackDTO]) -> "OrderedDict[str, TrackDTO]":
    unique: "OrderedDict[str, TrackDTO]" = OrderedDict()
    for track in tracks:
        unique.setdefault(track.track_key, track)
    return unique
