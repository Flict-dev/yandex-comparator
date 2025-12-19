from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException, status

from app.models import CompareRequestDTO, ComparisonResultDTO
from app.parser import PlaylistUrlError, parse_playlist_url
from app.providers.web_handler import ProviderError, WebHandlerProvider
from app.services.similarity import SimilarityService

router = APIRouter()
provider = WebHandlerProvider()
service = SimilarityService()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/compare", response_model=ComparisonResultDTO)
async def compare_playlists(payload: CompareRequestDTO) -> ComparisonResultDTO:
    refs = []
    try:
        for index, url in enumerate(payload.playlist_urls, start=1):
            refs.append(parse_playlist_url(url))
    except PlaylistUrlError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Playlist #{index}: {exc}",
        ) from exc
    try:
        snapshots = await asyncio.gather(*(provider.fetch(ref) for ref in refs))
    except ProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return service.compare(refs, snapshots)
