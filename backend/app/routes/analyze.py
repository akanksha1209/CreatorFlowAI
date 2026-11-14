import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import ContentIntent, FormatType, Platform, Project
from app.schemas.analyze import TopicAnalysisRequest, TopicAnalysisResponse
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/", response_model=TopicAnalysisResponse)
async def analyze_topic(request: TopicAnalysisRequest, db: Session = Depends(get_db)):
    try:
        result = await AIService().analyze_topic(request.topic.strip())
        choices = {
            "content_intent": ({"educational", "entertainment", "inspirational", "promotional", "news", "tutorial", "review", "comparison"}, "educational"),
            "best_platform": ({"instagram", "youtube", "both"}, "both"),
            "best_format": ({"short_form", "long_form", "both"}, "short_form"),
        }
        for key, (valid, default) in choices.items():
            value = str(result.get(key) or default).strip().lower().replace("-", "_").replace(" ", "_")
            result[key] = value if value in valid else default
        competition = str(result.get("competition_level", "medium")).lower().strip()
        result["competition_level"] = competition if competition in {"low", "medium", "high"} else "medium"
        values = {
            "topic": request.topic.strip(), "summary": result.get("summary", ""),
            "content_intent": ContentIntent(result["content_intent"]), "target_audience": result.get("target_audience", ""),
            "audience_reasoning": result.get("audience_reasoning", ""), "best_platform": Platform(result["best_platform"]),
            "platform_reasoning": result.get("platform_reasoning", ""), "best_format": FormatType(result["best_format"]),
            "format_reasoning": result.get("format_reasoning", ""), "topic_potential": result.get("topic_potential", ""),
            "viral_potential_score": result.get("viral_potential_score", 0),
            "viral_potential_reasoning": result.get("viral_potential_reasoning", ""),
            "trend_relevance": result.get("trend_relevance", ""), "trend_reasoning": result.get("trend_reasoning", ""),
            "competition_level": result["competition_level"], "content_gap": result.get("content_gap", ""),
            "differentiation_strategy": result.get("differentiation_strategy", ""),
            "recommended_tone": result.get("recommended_tone", "friendly"),
            "recommended_length": result.get("recommended_length", ""),
            "key_points": json.dumps(result.get("key_points", [])),
            "things_to_avoid": json.dumps(result.get("things_to_avoid", [])),
        }
        if request.project_id is not None:
            project = db.query(Project).filter(Project.id == request.project_id).first()
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
            for key, value in values.items():
                setattr(project, key, value)
        else:
            project = Project(**values)
            db.add(project)
        db.commit()
        db.refresh(project)
        return TopicAnalysisResponse.model_validate({**result, "topic": project.topic, "id": project.id})
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail=f"Analysis failed: {exc}") from exc
