from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse


@dataclass(frozen=True)
class ParsedPlaylistRef:
    owner_login: str
    kind: int


class PlaylistUrlError(ValueError):
    pass


def parse_playlist_url(url: str) -> ParsedPlaylistRef:
    if not url:
        raise PlaylistUrlError("Empty URL")
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise PlaylistUrlError("Unsupported URL scheme")
    if parsed.netloc not in {"music.yandex.ru", "music.yandex.com"}:
        raise PlaylistUrlError("Unsupported host")
    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) < 4 or parts[0] != "users" or parts[2] != "playlists":
        raise PlaylistUrlError("URL does not match playlist format")
    owner_login = parts[1]
    kind_str = parts[3]
    if not owner_login:
        raise PlaylistUrlError("Missing owner login")
    if not kind_str.isdigit():
        raise PlaylistUrlError("Playlist kind must be an integer")
    return ParsedPlaylistRef(owner_login=owner_login, kind=int(kind_str))
