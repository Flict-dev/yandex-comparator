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
    try:
        ref_a = parse_playlist_url(payload.playlist_urls[0])
        ref_b = parse_playlist_url(payload.playlist_urls[1])
    except PlaylistUrlError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    try:
        snapshot_a, snapshot_b = await asyncio.gather(
            provider.fetch(ref_a),
            provider.fetch(ref_b),
        )
    except ProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return service.compare(ref_a, ref_b, snapshot_a, snapshot_b)
