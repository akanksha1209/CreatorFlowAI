from fastapi import APIRouter, HTTPException, Depends
from app.schemas.generate import ContentGenerationRequest, ContentGenerationResponse
from app.services.ai_service import AIService
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.project_version import ProjectVersion
import json

router = APIRouter()

@router.post("/", response_model=ContentGenerationResponse)
async def generate_content(
    request: ContentGenerationRequest,
    db: Session = Depends(get_db)
):
    try:
        # Get project
        project = db.query(Project).filter(Project.id == request.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Initialize AI service
        ai_service = AIService()
        
        # Generate content using AI
        generation_result = await ai_service.generate_content(
            topic=project.topic,
            analysis={
                "content_intent": project.content_intent.value if project.content_intent else None,
                "target_audience": project.target_audience,
                "best_platform": project.best_platform.value if project.best_platform else None,
                "best_format": project.best_format.value if project.best_format else None,
                "recommended_tone": project.recommended_tone,
                "recommended_length": project.recommended_length,
                "key_points": json.loads(project.key_points) if project.key_points else [],
                "things_to_avoid": json.loads(project.things_to_avoid) if project.things_to_avoid else []
            }
        )
        
        # Save version
        version_number = db.query(ProjectVersion).filter(
            ProjectVersion.project_id == project.id
        ).count() + 1
        
        db_version = ProjectVersion(
            project_id=project.id,
            version_number=version_number,
            titles=json.dumps(generation_result.get("titles", [])),
            hooks=json.dumps(generation_result.get("hooks", [])),
            script=generation_result.get("script", ""),
            caption=generation_result.get("caption", ""),
            hashtags=json.dumps(generation_result.get("hashtags", [])),
            cta=generation_result.get("cta", ""),
            alternative_angles=json.dumps(generation_result.get("alternative_angles", [])),
            future_ideas=json.dumps(generation_result.get("future_ideas", [])),
            repurposing_suggestions=json.dumps(generation_result.get("repurposing_suggestions", {}))
        )
        
        db.add(db_version)
        db.commit()
        
        # Return response
        return ContentGenerationResponse(
            project_id=project.id,
            titles=generation_result.get("titles", []),
            hooks=generation_result.get("hooks", []),
            script=generation_result.get("script", ""),
            caption=generation_result.get("caption", ""),
            hashtags=generation_result.get("hashtags", []),
            cta=generation_result.get("cta", ""),
            alternative_angles=generation_result.get("alternative_angles", []),
            future_ideas=generation_result.get("future_ideas", []),
            repurposing_suggestions=generation_result.get("repurposing_suggestions", {})
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")