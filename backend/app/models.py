from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    chat_id: str | None = None
    history: list[ChatMessage] = []
    audience: str = "general"


class Source(BaseModel):
    title: str
    url: str | None = None
    content: str


class ChatResponse(BaseModel):
    chat_id: str | None
    answer: str
    sources: list[Source] = []


class HealthResponse(BaseModel):
    status: str
    app: str

