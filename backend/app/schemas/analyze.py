from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.project import ContentIntent, Platform, FormatType

class TopicAnalysisRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500)
    project_id: Optional[int] = None

class TopicAnalysisResponse(BaseModel):
    id: int
    topic: str
    summary: str
    content_intent: ContentIntent
    target_audience: str
    audience_reasoning: str
    best_platform: Platform
    platform_reasoning: str
    best_format: FormatType
    format_reasoning: str
    topic_potential: str
    viral_potential_score: int = Field(..., ge=0, le=100)
    viral_potential_reasoning: str
    trend_relevance: str
    trend_reasoning: str
    competition_level: str
    content_gap: str
    differentiation_strategy: str
    recommended_tone: str
    recommended_length: str
    key_points: List[str]
    things_to_avoid: List[str]