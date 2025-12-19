import pytest

from app.parser import PlaylistUrlError, parse_playlist_url


@pytest.mark.parametrize(
    "url,expected_login,expected_kind",
    [
        ("https://music.yandex.ru/users/user123/playlists/42", "user123", 42),
        ("https://music.yandex.com/users/abc/playlists/7?utm=1", "abc", 7),
        ("https://music.yandex.ru/users/test/playlists/99#hash", "test", 99),
    ],
)
def test_parse_playlist_url_valid(url: str, expected_login: str, expected_kind: int) -> None:
    parsed = parse_playlist_url(url)
    assert parsed.owner_login == expected_login
    assert parsed.kind == expected_kind


@pytest.mark.parametrize(
    "url",
    [
        "",
        "ftp://music.yandex.ru/users/user/playlists/1",
        "https://example.com/users/user/playlists/1",
        "https://music.yandex.ru/users/user/playlist/1",
        "https://music.yandex.ru/users/user/playlists/abc",
        "https://music.yandex.ru/users//playlists/1",
    ],
)
def test_parse_playlist_url_invalid(url: str) -> None:
    with pytest.raises(PlaylistUrlError):
        parse_playlist_url(url)
