import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat_message import ChatMessage
from app.models.project import Project
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import AIService

router = APIRouter()


def enum_value(value):
    return value.value if hasattr(value, "value") else value


def decode_list(value):
    try:
        return json.loads(value) if value else []
    except (TypeError, json.JSONDecodeError):
        return []


@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    user_message = ChatMessage(project_id=request.project_id, message_type="user", content=request.message.strip())
    try:
        db.add(user_message)
        db.flush()
        history = db.query(ChatMessage).filter(ChatMessage.project_id == request.project_id).order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc()).all()
        result = await AIService().chat_with_context(
            project_id=request.project_id,
            user_message=request.message.strip(),
            chat_history=[{"type": message.message_type, "content": message.content} for message in history if message.id != user_message.id],
            project_context={"topic": project.topic, "analysis": {
                "content_intent": enum_value(project.content_intent), "target_audience": project.target_audience,
                "best_platform": enum_value(project.best_platform), "best_format": enum_value(project.best_format),
                "recommended_tone": project.recommended_tone, "recommended_length": project.recommended_length,
                "key_points": decode_list(project.key_points), "things_to_avoid": decode_list(project.things_to_avoid),
            }},
        )
        answer = result.get("response") or "I'm here to help you refine your content!"
        db.add(ChatMessage(project_id=request.project_id, message_type="ai", content=answer))
        db.commit()
        return ChatResponse(response=answer, updated_content=result.get("updated_content"))
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail=f"Chat failed: {exc}") from exc
