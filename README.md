# AI Agent for a Commerce Website

## Project Overview

This project is a simple commerce assistant that combines a product browser with an AI chat experience. The agent helps users explore a predefined product catalog, answer shopping questions, recommend products from text prompts, and support image-based product discovery.

### What the agent does

- lets users browse a catalog of commerce products
- answers general shopping questions in a conversational interface
- recommends products from the catalog based on text input
- supports image upload so the assistant can match visible items or attributes to catalog products

### Supported use cases

1. General chat: users can ask open-ended shopping questions such as what type of product may fit their needs.
2. Text recommendation: users can describe preferences, budget, or category, and the agent recommends up to three matching products from the catalog.
3. Image-based search: users can upload an image, and the agent analyzes the image and returns the closest catalog matches when possible.

Current UI note: the `View details` button is present in the product cards, but the detailed product page or modal is not implemented yet.

### Architecture summary

- the frontend is a React + Vite single-page app that renders the product browser and the AI chat panel
- the backend is a FastAPI service that exposes product and chat endpoints
- product data is loaded from a local CSV catalog
- the backend builds a catalog-aware system prompt and sends user messages to the OpenAI API
- the model returns structured JSON containing a reply and a list of recommended product IDs
- the backend maps those IDs back to products from the catalog and sends both the reply and matching products to the frontend

## Live Demo

Frontend: https://take-home-exercise-ai-agent-for-a-c.vercel.app/

Note: the backend is deployed on a free tier. After inactivity, the first request may take around 30 to 50 seconds while the service wakes up.

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Axios
- React Router

### Backend

- FastAPI
- Python
- Uvicorn
- Pydantic

### Model / API

- OpenAI API
- current backend implementation uses the OpenAI Python SDK and prefers the Responses API when available, with a fallback to Chat Completions

### Catalog storage

- current implementation uses a simple CSV file: [products.csv](/Users/yuhong/Desktop/Take-Home-Exercise-AI-Agent-for-a-Commerce-Website/backend/data/products.csv)
- this is enough for a small predefined catalog and keeps the take-home exercise lightweight
- for future production work, relational storage such as PostgreSQL would fit structured commerce data, relationships, inventory, and secure transactional workflows
- for future production work, document storage such as MongoDB could be useful if product schemas need to stay more flexible

## Why This Stack

- React was chosen for a fast, interactive UI and because it is one of the most common choices for modern frontend development.
- Vite keeps the local development workflow simple and fast.
- FastAPI was chosen because it provides clean API design, strong typing, and automatic Swagger documentation at `/docs`.
- Python makes the backend easier to extend with future AI, LLM, ranking, or retrieval logic.
- OpenAI API was chosen for flexible natural language understanding and multimodal support.
- CSV storage keeps the current version easy to review and maintain without adding database setup overhead.

## Setup Instructions

### Prerequisites

- Node.js 18+ recommended
- Python 3.10+ recommended

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`.

Optional local Python pin:

```bash
cd backend
pyenv local 3.10.13
```

### Environment variables

Backend variables:

- `OPENAI_API_KEY`: required for chat and image-based requests
- `OPENAI_MODEL`: optional, defaults to `gpt-4o-mini`
- `CORS_ORIGINS` or `CORS_ORIGIN`: optional, defaults to local frontend origins

Frontend variables:

- `VITE_API_URL`: backend base URL used by the frontend for `/products` and `/chat`

## API Documentation

A documented set of backend API endpoints for the commerce agent.

- Repo API document: API_DOCS.md (in the repo)
- Health check: `GET /health`
- Product catalog: `GET /products`
- AI chat: `POST /chat`

The FastAPI application title is defined in [main.py](/Users/yuhong/Desktop/Take-Home-Exercise-AI-Agent-for-a-Commerce-Website/backend/main.py).

## Project Structure

```text
backend/
  api/
    chat.py          # AI chat endpoint, prompt building, OpenAI request handling
    products.py      # product catalog endpoint and CSV loading
  data/
    products.csv     # predefined product catalog
  main.py            # FastAPI app setup, CORS, router registration
  requirements.txt   # backend dependencies

frontend/
  src/
    components/
      ChatPanel.tsx  # AI assistant UI
      Message.tsx    # shared frontend message and product types
    pages/
      Broswe.tsx     # product browser page
    styles/
      browser.css    # browser page styles
      chat-panel.css # chat panel styles
    App.tsx          # routes
    main.tsx         # frontend entry point
```

## Design Decisions

### How the agent decides between general chat, text recommendation, and image search

- image-based handling is first determined by the request itself: if the last user message includes an uploaded image, the backend sends that image to the OpenAI workflow
- for non-image requests, the backend does not use a separate hardcoded intent classifier
- instead, it gives the model a catalog-aware system prompt and asks it to decide how to respond based on the user input
- the model must return structured JSON with a natural-language `reply` and a `product_ids` list when specific catalog products are recommended

This keeps the request flow simple while still supporting the three required behaviors.

### Why the catalog is predefined

- the predefined catalog gives the model bounded, reliable product knowledge
- this reduces hallucination risk because the model is instructed to recommend only items that exist in the catalog
- it also makes product recommendation easier to evaluate in a take-home setting because the available inventory is fixed and transparent

### How image upload is handled

- the frontend sends chat messages and the selected image as multipart form data to `POST /chat`
- the backend parses the text messages and optional image upload
- when the OpenAI SDK supports the Responses API, the image is uploaded to OpenAI as a file and referenced in the model input
- if image analysis is unavailable, the backend still falls back gracefully and the assistant can continue from text context

### Why the architecture is simple and maintainable

- frontend and backend responsibilities are clearly separated
- product loading logic and chat logic are split into separate backend modules
- the backend keeps catalog access independent from AI request handling
- the response format is structured, which makes the frontend simpler and more deterministic
- the frontend only sends the 10 most recent chat messages to the backend, which keeps payload size smaller while preserving near-term conversation context
- the code is small enough to understand quickly and easy to refactor
- one future improvement would be to move request and response models into separate modules to keep `chat.py` narrower as the project grows

## Deployment Notes

### Frontend on Vercel

Configure the frontend deployment to call the deployed backend URL using `VITE_API_URL`.

Important: if the deployment uses a different variable name, the frontend falls back to `http://localhost:8000`, which will break production requests.

### Backend on Render

Deploy the `backend` directory as a web service. The repository includes [Dockerfile](/Users/yuhong/Desktop/Take-Home-Exercise-AI-Agent-for-a-Commerce-Website/backend/Dockerfile) for Docker-based deployment.

Configure the backend with:

- `OPENAI_API_KEY`
- optional `OPENAI_MODEL`
- `CORS_ORIGINS` that includes the deployed frontend origin

### Production wiring

- the Vercel frontend sends requests to the configured backend URL
- the Render backend allows the frontend origin through CORS
- both services should be redeployed after environment variable changes

## Limitations and Future Improvements

- conversation memory is limited to the recent messages sent by the frontend; longer-term memory and session storage could improve continuity
- image retrieval is basic and depends on the LLM workflow; more advanced multimodal retrieval or embeddings-based search could improve visual matching
- CSV storage is fine for a small demo but should be replaced with a real database for production use
- there is no authentication, inventory management, or checkout flow in the current version
- backend cold starts on the free-tier deployment create a noticeable delay for the first request after inactivity
