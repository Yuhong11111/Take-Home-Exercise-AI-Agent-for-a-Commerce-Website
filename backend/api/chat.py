import json
import os
from typing import Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, ValidationError

from api.products import Product, load_products

router = APIRouter(prefix="/chat", tags=["ai"])

class ChatMessage(BaseModel):
    role: Literal["user", "ai"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    products: list[Product] = []

# return a list of products in a formatted string for the system prompt, so the model can understand the catalog information
# For instance: - id=1 | name=Lumen Desk Lamp | price=98 | category=Lighting | tag=Best Seller
def build_catalog_prompt(products: list[Product]) -> str:
    lines = ["Catalog:"]
    for product in products:
        lines.append(
            f"- id={product.id} | name={product.name} | price={product.price} | "
            f"category={product.category} | tag={product.tag}"
        )
    return "\n".join(lines)

# embed the catalog information into the system prompt, and instruct the model how to use the catalog for recommendation and search. Emphasize that only products in the catalog can be recommended, and at most 3 products should be recommended.
def build_system_prompt(catalog: str) -> str:
    return (
        "You are a helpful shopping assistant for an e-commerce website. "
        "You can chat normally, recommend products from the catalog, and do image-based product search. "
        "Only recommend products that exist in the catalog below. "
        "When you recommend products, choose up to 3 best matches.\n"
        "If you mention a specific product by name in your reply, you MUST include its id in product_ids.\n\n"
        "If an image is provided, describe the key items or attributes in the image first, then match them to the catalog. "
        "If the image does not match any catalog item, say so and suggest the closest alternatives.\n\n"
        "Return a JSON object ONLY with keys:\n"
        '- "reply": string\n'
        '- "product_ids": array of integers (may be empty)\n\n'
        f"{catalog}"
    )


def build_response_schema() -> dict:
    return {
        "type": "object",
        "properties": {
            "reply": {"type": "string"},
            "product_ids": {"type": "array", "items": {"type": "integer"}},
        },
        "required": ["reply", "product_ids"],
        "additionalProperties": False,
    }

# parse the model response, extract the reply text and the recommended product ids. 
def parse_model_json(text: str) -> tuple[str, list[int]]:
    try:
        data = json.loads(text)
        reply = data.get("reply", "")
        ids = data.get("product_ids", [])
        if not isinstance(reply, str) or not isinstance(ids, list):
            return text, []
        return reply, [int(x) for x in ids if isinstance(x, int) or str(x).isdigit()]
    except json.JSONDecodeError:
        return text, []

# parse the conversation messages into the format that OpenAI API expects, and append the image reference if there's an uploaded image in the last user message
def build_input_messages(messages: list[ChatMessage], image_file_id: Optional[str]) -> list[dict]:
    input_messages: list[dict] = []
    for idx, msg in enumerate(messages):
        role = "assistant" if msg.role == "ai" else msg.role
        if role == "assistant":
            content: list[dict] = [{"type": "output_text", "text": msg.content}]
        else:
            content = [{"type": "input_text", "text": msg.content}]
        if image_file_id and idx == len(messages) - 1 and role == "user":
            content.append({"type": "input_image", "file_id": image_file_id})
        input_messages.append({"role": role, "content": content})
    return input_messages


def build_chat_completion_messages(
    messages: list[ChatMessage],
    system_prompt: str,
    has_image: bool,
) -> list[dict]:
    completion_messages: list[dict] = [{"role": "system", "content": system_prompt}]
    for idx, msg in enumerate(messages):
        role = "assistant" if msg.role == "ai" else msg.role
        content = msg.content
        if has_image and idx == len(messages) - 1 and role == "user":
            content = (
                f"{content}\n\n"
                "The user also uploaded an image. If visual analysis is unavailable, say that image "
                "analysis is temporarily unavailable and continue helping from the text context."
            )
        completion_messages.append({"role": role, "content": content})
    return completion_messages


def request_model_reply(
    client: OpenAI,
    payload: ChatRequest,
    system_prompt: str,
    image_file_id: Optional[str],
    has_image: bool,
) -> str:
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if hasattr(client, "responses"):
        response = client.responses.create(
            model=model,
            text={
                "format": {
                    "type": "json_schema",
                    "name": "chat_response",
                    "strict": True,
                    "schema": build_response_schema(),
                }
            },
            input=[
                {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
                *build_input_messages(payload.messages, image_file_id),
            ],
        )
        return response.output_text or ""

    response = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=build_chat_completion_messages(payload.messages, system_prompt, has_image),
    )
    return response.choices[0].message.content or ""



@router.post("", response_model=ChatResponse)
def ai_chat(
    messages_json: str = Form(...),
    image: Optional[UploadFile] = File(None),
) -> ChatResponse:
    try:
        payload = ChatRequest(**json.loads(messages_json))
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # fetch all product
    products = load_products()
    # format all catalog info
    catalog_prompt = build_catalog_prompt(products)
    # build system prompt with catalog info
    system_prompt = build_system_prompt(catalog_prompt)

    try:
        client = OpenAI()
    except OpenAIError:
        reply = "AI is not configured. Please set OPENAI_API_KEY."
        return ChatResponse(reply=reply, products=[])

    has_image = image is not None
    image_file_id: Optional[str] = None
    if image is not None and hasattr(client, "responses"):
        try:
            file_bytes = image.file.read()
            uploaded = client.files.create(
                file=(image.filename, file_bytes, image.content_type),
                purpose="vision",
            )  # upload image to OpenAI for vision processing, get file_id for reference in the model input
            image_file_id = uploaded.id
        except OpenAIError:
            image_file_id = None

    try:
        reply_text = request_model_reply(
            client=client,
            payload=payload,
            system_prompt=system_prompt,
            image_file_id=image_file_id,
            has_image=has_image,
        )
    except OpenAIError as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {exc}")

    reply, product_ids = parse_model_json(reply_text)
    # find products that match the recommended ids, and return them in the response
    product_map = {product.id: product for product in products}
    selected_products = [product_map[pid] for pid in product_ids if pid in product_map]

    return ChatResponse(reply=reply, products=selected_products)
