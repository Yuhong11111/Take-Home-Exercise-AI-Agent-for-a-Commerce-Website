from api.products import Product
import json
from typing import Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from openai import OpenAI
from pydantic import BaseModel, ValidationError

router = APIRouter(prefix="/chat", tags=["ai"])

client = OpenAI()  # Initialize OpenAI client 

class ChatMessage(BaseModel):
    role: Literal["user", "ai"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    products: list[Product] = []  # For product recommendations

# answer general question
# recommend products based on text
# return images of products based on search queries


def mock_chat_response(messages: list[ChatMessage]) -> ChatResponse:
    last_user = next((m for m in reversed(messages) if m.role == "user"), None)
    prompt = last_user.content if last_user else ""
    return ChatResponse(reply=f"Mock response for: {prompt}")


@router.post("", response_model=ChatResponse)
def ai_chat(
    messages_json: str = Form(...),
    image: Optional[UploadFile] = File(None),
) -> ChatResponse:
    try:
        payload = ChatRequest(**json.loads(messages_json))
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # TODO: wire `image` into the AI flow; for now just accept it.
    _ = image
    return mock_chat_response(payload.messages)
