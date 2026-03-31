# Take-Home-Exercise-AI-Agent-for-a-Commerce-Website

## Setup

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.
If you prefer `npm start`, add it to `frontend/package.json` or use `npm run dev`.

### Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend runs at `http://localhost:8000` and includes `GET /health`.
