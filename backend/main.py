from pathlib import Path

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables (e.g., OPENAI_API_KEY) before importing modules that use them.
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

from api import chat, products

app = FastAPI(title="Commerce Backend")

cors_origins_env = os.getenv("CORS_ORIGINS") or os.getenv(
    "CORS_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173"
)
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/.well-known/appspecific/com.chrome.devtools.json", include_in_schema=False)
def chrome_devtools_probe():
    return {}


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}

app.include_router(chat.router)
app.include_router(products.router)
