from fastapi import APIRouter, HTTPException, Depends
from app.schemas.analyze import TopicAnalysisRequest, TopicAnalysisResponse
from app.services.ai_service import AIService
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.project import Project
import json

router = APIRouter()

@router.post("/", response_model=TopicAnalysisResponse)
async def analyze_topic(
    request: TopicAnalysisRequest,
    db: Session = Depends(get_db)
):
    try:
        # Initialize AI service
        ai_service = AIService()
        
        # Analyze the topic using AI
        analysis_result = await ai_service.analyze_topic(request.topic)
        
        # Save to database
        db_project = Project(
            topic=request.topic,
            summary=analysis_result.get("summary"),
            content_intent=analysis_result.get("content_intent"),
            target_audience=analysis_result.get("target_audience"),
            audience_reasoning=analysis_result.get("audience_reasoning"),
            best_platform=analysis_result.get("best_platform"),
            platform_reasoning=analysis_result.get("platform_reasoning"),
            best_format=analysis_result.get("best_format"),
            format_reasoning=analysis_result.get("format_reasoning"),
            topic_potential=analysis_result.get("topic_potential"),
            viral_potential_score=analysis_result.get("viral_potential_score"),
            viral_potential_reasoning=analysis_result.get("viral_potential_reasoning"),
            trend_relevance=analysis_result.get("trend_relevance"),
            trend_reasoning=analysis_result.get("trend_reasoning"),
            competition_level=analysis_result.get("competition_level"),
            content_gap=analysis_result.get("content_gap"),
            differentiation_strategy=analysis_result.get("differentiation_strategy"),
            recommended_tone=analysis_result.get("recommended_tone"),
            recommended_length=analysis_result.get("recommended_length"),
            key_points=json.dumps(analysis_result.get("key_points", [])),
            things_to_avoid=json.dumps(analysis_result.get("things_to_avoid", []))
        )
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        # Return response
        return TopicAnalysisResponse(
            topic=request.topic,
            summary=analysis_result.get("summary", ""),
            content_intent=analysis_result.get("content_intent"),
            target_audience=analysis_result.get("target_audience", ""),
            audience_reasoning=analysis_result.get("audience_reasoning", ""),
            best_platform=analysis_result.get("best_platform"),
            platform_reasoning=analysis_result.get("platform_reasoning", ""),
            best_format=analysis_result.get("best_format"),
            format_reasoning=analysis_result.get("format_reasoning", ""),
            topic_potential=analysis_result.get("topic_potential", ""),
            viral_potential_score=analysis_result.get("viral_potential_score", 0),
            viral_potential_reasoning=analysis_result.get("viral_potential_reasoning", ""),
            trend_relevance=analysis_result.get("trend_relevance", ""),
            trend_reasoning=analysis_result.get("trend_reasoning", ""),
            competition_level=analysis_result.get("competition_level", ""),
            content_gap=analysis_result.get("content_gap", ""),
            differentiation_strategy=analysis_result.get("differentiation_strategy", ""),
            recommended_tone=analysis_result.get("recommended_tone", ""),
            recommended_length=analysis_result.get("recommended_length", ""),
            key_points=analysis_result.get("key_points", []),
            things_to_avoid=analysis_result.get("things_to_avoid", [])
        )
        
    except Exception as e:
     import traceback
     traceback.print_exc()
     raise HTTPException(
        status_code=500,
        detail=f"Analysis failed: {type(e).__name__}: {str(e)}"
     )