from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from app.database import get_supabase  # noqa: E402
from app.rag import chunk_text, create_embedding  # noqa: E402


def ingest_markdown_file(path: Path) -> int:
    supabase = get_supabase()
    if supabase is None:
        raise RuntimeError("Supabase is not configured. Check backend/.env.")

    title = path.stem.replace("_", " ").replace("-", " ").title()
    content = path.read_text(encoding="utf-8")

    document = supabase.table("knowledge_documents").insert(
        {
            "title": title,
            "source_url": None,
            "audience": "general",
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
                "source_url": None,
                "audience": "general",
                "embedding": create_embedding(chunk),
            }
        )

    if rows:
        supabase.table("knowledge_chunks").insert(rows).execute()

    return len(rows)


def main() -> None:
    seed_dir = PROJECT_ROOT / "knowledge_base" / "seed"
    files = sorted(seed_dir.glob("*.md"))

    if not files:
        print("No markdown files found.")
        return

    total = 0
    for path in files:
        count = ingest_markdown_file(path)
        total += count
        print(f"Ingested {count} chunks from {path.name}")

    print(f"Done. Total chunks: {total}")


if __name__ == "__main__":
    main()

