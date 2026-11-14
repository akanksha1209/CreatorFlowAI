import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.models.project_version import ProjectVersion
from app.schemas.generate import ContentGenerationRequest, ContentGenerationResponse
from app.services.ai_service import AIService

router = APIRouter()


def enum_value(value):
    return value.value if hasattr(value, "value") else value


@router.post("/", response_model=ContentGenerationResponse)
async def generate_content(request: ContentGenerationRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        analysis = {"content_intent": enum_value(project.content_intent),
                   "target_audience": project.target_audience, "best_platform": enum_value(project.best_platform),
                   "best_format": enum_value(project.best_format), "recommended_tone": project.recommended_tone,
                   "recommended_length": project.recommended_length,
                   "key_points": json.loads(project.key_points) if project.key_points else [],
                   "things_to_avoid": json.loads(project.things_to_avoid) if project.things_to_avoid else []}
        result = await AIService().generate_content(topic=project.topic, analysis=analysis)
        number = (db.query(ProjectVersion).filter(ProjectVersion.project_id == project.id).count() or 0) + 1
        version = ProjectVersion(project_id=project.id, version_number=number,
                                 titles=json.dumps(result.get("titles", [])), hooks=json.dumps(result.get("hooks", [])),
                                 script=result.get("script", ""), caption=result.get("caption", ""),
                                 hashtags=json.dumps(result.get("hashtags", [])), cta=result.get("cta", ""),
                                 alternative_angles=json.dumps(result.get("alternative_angles", [])),
                                 future_ideas=json.dumps(result.get("future_ideas", [])),
                                 repurposing_suggestions=json.dumps(result.get("repurposing_suggestions", {})))
        db.add(version)
        db.commit()
        return ContentGenerationResponse(project_id=project.id, **result)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail=f"Generation failed: {exc}") from exc
