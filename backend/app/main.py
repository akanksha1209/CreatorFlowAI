import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.database import Base, engine
from app.models import User, Project, ProjectVersion, GeneratedContent, ChatMessage, SavedProject  # noqa: F401
from app.routes import analyze, generate, chat, projects

load_dotenv()
Base.metadata.create_all(bind=engine)

# Add columns introduced after initial releases to existing SQLite installations.
if engine.dialect.name == "sqlite":
    with engine.begin() as connection:
        existing = {column["name"] for column in inspect(engine).get_columns("project_versions")}
        columns = {"titles": "TEXT", "hooks": "TEXT", "alternative_angles": "TEXT",
                   "future_ideas": "TEXT", "repurposing_suggestions": "TEXT"}
        for name, sql_type in columns.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE project_versions ADD COLUMN {name} {sql_type}"))

app = FastAPI(title="CreatorFlow AI API", description="AI-powered content strategy and generation platform", version="1.0.0")
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://creatorflowai-theta.vercel.app").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app"),
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])


@app.get("/")
async def root():
    return {"message": "CreatorFlow AI API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
