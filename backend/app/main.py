from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import chat, health, ingest

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI chatbot backend for University of Benin inquiries.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "UNIBEN Compass AI backend is running", "docs": "/docs"}


app.include_router(health.router)
app.include_router(chat.router)

if settings.enable_ingest_endpoint:
    if not settings.ingest_admin_token:
        raise RuntimeError(
            "INGEST_ADMIN_TOKEN must be configured when "
            "ENABLE_INGEST_ENDPOINT is enabled."
        )
    app.include_router(ingest.router)
