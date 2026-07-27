import logging
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.ai import get_chat_client
from app.database import get_supabase
from app.models import ChatRequest, ChatResponse
from app.rag import format_sources_for_prompt, search_knowledge

router = APIRouter(prefix="/api", tags=["chat"])
logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """
You are UNIBEN Compass AI, a helpful chatbot for the University of Benin.

Your audience includes:
- Prospective undergraduate students
- Prospective postgraduate students
- Newly admitted students
- Current students
- Staff
- Parents, guardians, and members of the public

Rules:
1. Be clear, polite, and beginner-friendly.
2. Use the knowledge base context when available.
3. If you are not sure, say so and suggest checking the official University of Benin website or admissions office.
4. Do not invent deadlines, fees, phone numbers, admission requirements, or official policies.
5. For urgent or official decisions, tell users to confirm with the relevant UNIBEN office.
6. Keep answers organized and practical.
"""


def save_message(chat_id: str, role: str, content: str) -> None:
    supabase = get_supabase()
    if supabase is None:
        return

    supabase.table("messages").insert(
        {
            "chat_id": chat_id,
            "role": role,
            "content": content,
        }
    ).execute()


def ensure_chat(chat_id: str | None, first_message: str) -> str:
    if chat_id:
        return chat_id

    new_chat_id = str(uuid4())
    supabase = get_supabase()
    if supabase is not None:
        title = first_message[:60] + ("..." if len(first_message) > 60 else "")
        supabase.table("chats").insert({"id": new_chat_id, "title": title}).execute()

    return new_chat_id


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        sources = search_knowledge(request.message, request.audience)
        context = format_sources_for_prompt(sources)
        client, model = get_chat_client()
        chat_id = ensure_chat(request.chat_id, request.message)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "system",
                "content": f"Knowledge base context:\n\n{context}",
            },
        ]

        for item in request.history[-8:]:
            messages.append({"role": item.role, "content": item.content})

        messages.append({"role": "user", "content": request.message})

        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=1200,
        )

        answer = completion.choices[0].message.content or "I could not generate an answer."

        save_message(chat_id, "user", request.message)
        save_message(chat_id, "assistant", answer)

        return ChatResponse(chat_id=chat_id, answer=answer, sources=sources)

    except RuntimeError as error:
        logger.exception("Chat request failed with a runtime error")
        raise HTTPException(status_code=500, detail=str(error)) from error
    except Exception as error:
        logger.exception("Chat request failed unexpectedly")
        raise HTTPException(
            status_code=500,
            detail="The chatbot could not answer right now. Please try again.",
        ) from error
