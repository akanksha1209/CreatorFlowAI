from fastapi import APIRouter, HTTPException, Depends
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import AIService
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.chat_message import ChatMessage
import json

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    try:
        # Get project
        project = db.query(Project).filter(Project.id == request.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Save user message
        user_message = ChatMessage(
            project_id=request.project_id,
            message_type="user",
            content=request.message
        )
        db.add(user_message)
        
        # Get chat history
        chat_history = db.query(ChatMessage).filter(
            ChatMessage.project_id == request.project_id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        # Initialize AI service
        ai_service = AIService()
        
        # Get AI response
        ai_response = await ai_service.chat_with_context(
            project_id=request.project_id,
            user_message=request.message,
            chat_history=[{
                "type": msg.message_type,
                "content": msg.content
            } for msg in chat_history],
            project_context={
                "topic": project.topic,
                "analysis": {
                    "content_intent": project.content_intent.value if project.content_intent else None,
                    "target_audience": project.target_audience,
                    "best_platform": project.best_platform.value if project.best_platform else None,
                    "best_format": project.best_format.value if project.best_format else None,
                    "recommended_tone": project.recommended_tone,
                    "recommended_length": project.recommended_length,
                    "key_points": json.loads(project.key_points) if project.key_points else [],
                    "things_to_avoid": json.loads(project.things_to_avoid) if project.things_to_avoid else []
                }
            }
        )
        
        # Save AI message
        ai_message = ChatMessage(
            project_id=request.project_id,
            message_type="ai",
            content=ai_response.get("response", "")
        )
        db.add(ai_message)
        
        db.commit()
        
        # Return response
        return ChatResponse(
            response=ai_response.get("response", ""),
            updated_content=ai_response.get("updated_content")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")