import httpx
import pytest

from app.parser import ParsedPlaylistRef
from app.providers.web_handler import PlaylistSnapshot, WebHandlerProvider


class DummyAsyncClient:
    def __init__(self, response: httpx.Response) -> None:
        self._response = response

    async def __aenter__(self) -> "DummyAsyncClient":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        return None

    async def get(self, url: str, params: dict[str, str]) -> httpx.Response:
        return self._response


@pytest.mark.asyncio
async def test_web_handler_provider_parses_tracks(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = {
        "playlist": {
            "title": "Test",
            "tracks": [
                {
                    "id": 1,
                    "title": "Song",
                    "artists": [{"name": "Artist"}],
                    "albums": [{"id": 10}],
                    "durationMs": 123000,
                    "coverUri": "cover/%%",
                    "link": "https://music.yandex.ru/track/1",
                }
            ],
        }
    }
    response = httpx.Response(200, json=payload)

    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: DummyAsyncClient(response))

    provider = WebHandlerProvider(ttl_seconds=60)
    ref = ParsedPlaylistRef(owner_login="user", kind=1)
    snapshot = await provider.fetch(ref)

    assert isinstance(snapshot, PlaylistSnapshot)
    assert snapshot.title == "Test"
    assert len(snapshot.tracks) == 1
    track = snapshot.tracks[0]
    assert track.track_key == "1:10"
    assert track.duration_ms == 123000
    assert track.cover_url == "https://cover/200x200"
