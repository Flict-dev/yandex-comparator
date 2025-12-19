from __future__ import annotations

from fastapi import FastAPI

from app.api import router

app = FastAPI(title="Yandex Music Comparator")
app.include_router(router)
