from secrets import compare_digest
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field, HttpUrl

from app.config import get_settings
from app.database import get_supabase
from app.rag import chunk_text, create_embedding

router = APIRouter(prefix="/api", tags=["knowledge"])


class KnowledgeIngestRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=200_000)
    source_url: HttpUrl | None = None
    audience: str = Field(
        default="general",
        min_length=1,
        max_length=50,
        pattern=r"^[A-Za-z0-9_-]+$",
    )


def require_ingest_admin(
    x_admin_token: Annotated[str | None, Header()] = None,
) -> None:
    configured_token = get_settings().ingest_admin_token
    if (
        not configured_token
        or not x_admin_token
        or not compare_digest(x_admin_token, configured_token)
    ):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized.",
            headers={"WWW-Authenticate": "X-Admin-Token"},
        )


@router.post("/knowledge/ingest")
def ingest_text(
    request: KnowledgeIngestRequest,
    _: Annotated[None, Depends(require_ingest_admin)],
):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured.")

    source_url = str(request.source_url) if request.source_url else None
    document = supabase.table("knowledge_documents").insert(
        {
            "title": request.title,
            "source_url": source_url,
            "audience": request.audience,
        }
    ).execute()

    document_id = document.data[0]["id"]
    rows = []

    for chunk in chunk_text(request.content):
        rows.append(
            {
                "document_id": document_id,
                "content": chunk,
                "source_title": request.title,
                "source_url": source_url,
                "audience": request.audience,
                "embedding": create_embedding(chunk),
            }
        )

    supabase.table("knowledge_chunks").insert(rows).execute()
    return {"inserted_chunks": len(rows)}
