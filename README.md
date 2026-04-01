# Take-Home-Exercise-AI-Agent-for-a-Commerce-Website

## Live Demo

Frontend: https://take-home-exercise-ai-agent-for-a-c.vercel.app/

## Setup

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.
For local development, configure the frontend to point to the local backend URL.

### Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend runs at `http://localhost:8000` and includes `GET /health`.
For local development, configure the backend with your OpenAI credentials and local frontend origins.

Optional local Python pin:

```bash
cd backend
pyenv local 3.10.13
```

## Deployment

### Frontend on Vercel

Configure the frontend deployment to call the deployed Render backend URL.

Important: the frontend code reads `VITE_API_URL`. If Vercel uses a different variable name such as `VITE_API_BASE_URL`, the app will fall back to `http://localhost:8000`.

### Backend on Render

Deploy the `backend` directory as a web service. The repository includes [backend/Dockerfile](/Users/yuhong/Desktop/Take-Home-Exercise-AI-Agent-for-a-Commerce-Website/backend/Dockerfile) for Docker-based deployment.
Configure the backend deployment with your OpenAI credentials and allow the deployed Vercel frontend origin in CORS.

### Production wiring

- Vercel frontend sends requests to the configured backend URL
- Render backend allows the Vercel origin through its CORS configuration
- Both services must be redeployed after environment variable changes
