from fastapi import APIRouter, HTTPException

from app.database import get_supabase
from app.rag import chunk_text, create_embedding

router = APIRouter(prefix="/api", tags=["knowledge"])


@router.post("/knowledge/ingest")
def ingest_text(
    title: str,
    content: str,
    source_url: str | None = None,
    audience: str = "general",
):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase is not configured.")

    document = supabase.table("knowledge_documents").insert(
        {
            "title": title,
            "source_url": source_url,
            "audience": audience,
        }
    ).execute()

    document_id = document.data[0]["id"]
    rows = []

    for chunk in chunk_text(content):
        rows.append(
            {
                "document_id": document_id,
                "content": chunk,
                "source_title": title,
                "source_url": source_url,
                "audience": audience,
                "embedding": create_embedding(chunk),
            }
        )

    supabase.table("knowledge_chunks").insert(rows).execute()
    return {"inserted_chunks": len(rows)}

