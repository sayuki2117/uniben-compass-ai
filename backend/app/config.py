from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "UNIBEN Compass AI"
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3005"

    ai_provider: str = "openai"

    openai_api_key: str | None = None
    openai_chat_model: str = "gpt-4.1-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    openrouter_api_key: str | None = None
    openrouter_model: str = "openai/gpt-4.1-mini"
    openrouter_site_url: str = "http://localhost:3005"
    openrouter_site_name: str = "UNIBEN Compass AI"

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
