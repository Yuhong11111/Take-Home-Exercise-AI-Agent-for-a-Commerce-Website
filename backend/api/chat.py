from fastapi import APIRouter
from typing import Literal
from openai import OpenAI

from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["ai"])

client = OpenAI()  # Initialize OpenAI client 

class ChatMessage(BaseModel):
    role: Literal["user", "ai"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    mock: bool = True


def mock_chat_response(messages: list[ChatMessage]) -> ChatResponse:
    last_user = next((m for m in reversed(messages) if m.role == "user"), None)
    prompt = last_user.content if last_user else ""
    return ChatResponse(reply=f"Mock response for: {prompt}")


@router.post("", response_model=ChatResponse)
def ai_chat(payload: ChatRequest) -> ChatResponse:
    return mock_chat_response(payload.messages)
