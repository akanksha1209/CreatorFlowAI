import json
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.project import ContentIntent, Platform, FormatType


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

    @field_validator("key_points", "things_to_avoid", mode="before")
    @classmethod
    def decode_json_lists(cls, value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return []
        return value


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
    is_saved: bool = False
    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    size: int
