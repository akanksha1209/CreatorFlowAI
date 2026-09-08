from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.project import ContentIntent, Platform, FormatType
from datetime import datetime

class ProjectBase(BaseModel):
    topic: str
    summary: Optional[str] = None
    content_intent: Optional[ContentIntent] = None
    target_audience: Optional[str] = None
    audience_reasoning: Optional[str] = None
    best_platform: Optional[Platform] = None
    platform_reasoning: Optional[str] = None
    best_format: Optional[FormatType] = None
    format_reasoning: Optional[str] = None
    topic_potential: Optional[str] = None
    viral_potential_score: Optional[int] = Field(None, ge=0, le=100)
    viral_potential_reasoning: Optional[str] = None
    trend_relevance: Optional[str] = None
    trend_reasoning: Optional[str] = None
    competition_level: Optional[str] = None
    content_gap: Optional[str] = None
    differentiation_strategy: Optional[str] = None
    recommended_tone: Optional[str] = None
    recommended_length: Optional[str] = None
    key_points: Optional[list] = None
    things_to_avoid: Optional[list] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    topic: Optional[str] = None
    summary: Optional[str] = None
    content_intent: Optional[ContentIntent] = None
    target_audience: Optional[str] = None
    audience_reasoning: Optional[str] = None
    best_platform: Optional[Platform] = None
    platform_reasoning: Optional[str] = None
    best_format: Optional[FormatType] = None
    format_reasoning: Optional[str] = None
    topic_potential: Optional[str] = None
    viral_potential_score: Optional[int] = Field(None, ge=0, le=100)
    viral_potential_reasoning: Optional[str] = None
    trend_relevance: Optional[str] = None
    trend_reasoning: Optional[str] = None
    competition_level: Optional[str] = None
    content_gap: Optional[str] = None
    differentiation_strategy: Optional[str] = None
    recommended_tone: Optional[str] = None
    recommended_length: Optional[str] = None
    key_points: Optional[list] = None
    things_to_avoid: Optional[list] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    size: int