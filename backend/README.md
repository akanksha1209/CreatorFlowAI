# CreatorFlow AI Backend

This is the backend for CreatorFlow AI, an AI-powered content strategy and generation platform.

## Features

- Topic analysis using AI
- Content generation (titles, hooks, scripts, captions, etc.)
- Interactive AI chat with project context
- Project history and versioning
- Saved projects and favorites
- RESTful API

## Technology Stack

- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Database**: SQLite (with SQLAlchemy ORM)
- **AI Integration**: Configurable LLM API (OpenAI compatible)
- **Validation**: Pydantic

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Add your AI API key to the `.env` file:
   ```
   AI_API_KEY=your-api-key-here
   AI_MODEL=gpt-4o
   AI_BASE_URL=https://api.openai.com/v1
   ```

4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

### Analysis
- `POST /api/analyze/` - Analyze a topic and return content strategy

### Generation
- `POST /api/generate/` - Generate content package for a project

### Chat
- `POST /api/chat/` - Chat with AI about a project

### Projects
- `GET /api/projects/` - List projects
- `GET /api/projects/{id}` - Get specific project
- `POST /api/projects/` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/save` - Save/favorite project
- `GET /api/projects/{id}/history` - Get project history

## Database Models

- User
- Project
- ProjectVersion
- GeneratedContent
- ChatMessage
- SavedProject

## Environment Variables

- `AI_API_KEY`: Your AI service API key
- `AI_MODEL`: AI model to use (default: gpt-4o)
- `AI_BASE_URL`: Base URL for AI API (default: https://api.openai.com/v1)
- `DATABASE_URL`: Database connection string (default: sqlite:///./creatorflow.db)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)