from contextlib import asynccontextmanager
from fastapi import FastAPI
from .db import init_db
from . import models  # noqa: F401
from .routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="msgdoc-messaging", version="0.1.0", lifespan=lifespan)
app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "messaging"}
