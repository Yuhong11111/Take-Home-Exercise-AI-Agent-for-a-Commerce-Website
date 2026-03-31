from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import chat

app = FastAPI(title="Commerce Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
