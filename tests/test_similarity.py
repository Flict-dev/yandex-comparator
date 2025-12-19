from app.models import TrackDTO
from app.parser import ParsedPlaylistRef
from app.providers.web_handler import PlaylistSnapshot
from app.services.similarity import SimilarityService


def make_track(track_id: int, album_id: int, title: str) -> TrackDTO:
    return TrackDTO(
        track_key=f"{track_id}:{album_id}",
        track_id=track_id,
        album_id=album_id,
        title=title,
        artists=["Artist"],
    )


def test_similarity_empty() -> None:
    service = SimilarityService()
    ref_a = ParsedPlaylistRef(owner_login="a", kind=1)
    ref_b = ParsedPlaylistRef(owner_login="b", kind=2)
    snapshot_a = PlaylistSnapshot(title="A", tracks=[])
    snapshot_b = PlaylistSnapshot(title="B", tracks=[])
    result = service.compare([ref_a, ref_b], [snapshot_a, snapshot_b])
    assert result.playlists[0].count == 0
    assert result.playlists[1].count == 0
    assert result.track_keys_by_playlist == [[], []]
    assert result.tracks_index == {}


def test_similarity_partial_overlap() -> None:
    service = SimilarityService()
    ref_a = ParsedPlaylistRef(owner_login="a", kind=1)
    ref_b = ParsedPlaylistRef(owner_login="b", kind=2)
    snapshot_a = PlaylistSnapshot(
        title="A",
        tracks=[make_track(1, 10, "one"), make_track(2, 20, "two")],
    )
    snapshot_b = PlaylistSnapshot(
        title="B",
        tracks=[make_track(2, 20, "two"), make_track(3, 30, "three")],
    )
    result = service.compare([ref_a, ref_b], [snapshot_a, snapshot_b])
    assert result.playlists[0].count == 2
    assert result.playlists[1].count == 2
    assert len(result.tracks_index) == 3
    assert result.track_keys_by_playlist[0] == ["1:10", "2:20"]
    assert result.track_keys_by_playlist[1] == ["2:20", "3:30"]
