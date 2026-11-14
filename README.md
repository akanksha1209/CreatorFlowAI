# CreatorFlow AI

CreatorFlow AI is a React/Vite frontend backed by a FastAPI service.

## Run locally

1. Configure the backend environment and add a valid AI provider key:
   ```bash
   cp backend/.env.example backend/.env
   # Set AI_API_KEY in backend/.env
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
2. In a second terminal, start the frontend:
   ```bash
   cd frontend
   npm ci
   npm run dev -- --host 0.0.0.0
   ```

Vite proxies `/api` and `/health` to `http://127.0.0.1:8000` by default. Set `API_PROXY_TARGET` in the frontend environment to use a different backend URL, or set `VITE_API_BASE_URL` to call a deployed API directly. The browser uses relative API paths by default, so it never depends on a browser-localhost backend.

Analysis, content generation, and chat require `AI_API_KEY`. Project history, saved projects, and generated versions are stored in the configured database. Preferences on the Settings page are stored in this browser.
