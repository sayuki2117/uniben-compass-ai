from openai import OpenAI

from app.config import get_settings


def get_chat_client() -> tuple[OpenAI, str]:
    settings = get_settings()

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is missing.")
    return OpenAI(api_key=settings.openai_api_key), settings.openai_chat_model


def get_embedding_client() -> OpenAI:
    settings = get_settings()

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required for embeddings and RAG.")

    return OpenAI(api_key=settings.openai_api_key)
