from app.ai import get_embedding_client
from app.config import get_settings
from app.database import get_supabase
from app.models import Source


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 160) -> list[str]:
    clean_text = " ".join(text.split())
    chunks: list[str] = []
    start = 0

    while start < len(clean_text):
        end = start + chunk_size
        chunks.append(clean_text[start:end])
        start = end - overlap

    return [chunk for chunk in chunks if chunk.strip()]


def create_embedding(text: str) -> list[float]:
    settings = get_settings()
    client = get_embedding_client()
    response = client.embeddings.create(
        model=settings.openai_embedding_model,
        input=text,
    )
    return response.data[0].embedding


def search_knowledge(query: str, audience: str = "general", limit: int = 5) -> list[Source]:
    supabase = get_supabase()
    if supabase is None:
        return []

    query_embedding = create_embedding(query)

    result = supabase.rpc(
        "match_knowledge_chunks",
        {
            "query_embedding": query_embedding,
            "match_count": limit,
            "filter_audience": audience,
        },
    ).execute()

    sources: list[Source] = []
    for row in result.data or []:
        sources.append(
            Source(
                title=row.get("source_title") or "UNIBEN Knowledge Base",
                url=row.get("source_url"),
                content=row.get("content") or "",
            )
        )

    return sources


def format_sources_for_prompt(sources: list[Source]) -> str:
    if not sources:
        return "No knowledge base sources were found for this question."

    blocks = []
    for index, source in enumerate(sources, start=1):
        blocks.append(
            f"[Source {index}: {source.title}]\n"
            f"URL: {source.url or 'Not provided'}\n"
            f"{source.content}"
        )

    return "\n\n".join(blocks)

