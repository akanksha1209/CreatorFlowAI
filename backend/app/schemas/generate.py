from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.project import Platform, FormatType

class ContentGenerationRequest(BaseModel):
    project_id: int
    regenerate_all: bool = False
    specific_sections: Optional[List[str]] = None

class ContentGenerationResponse(BaseModel):
    project_id: int
    titles: List[str]
    hooks: List[str]
    script: str
    caption: str
    hashtags: List[str]
    cta: str
    alternative_angles: List[dict]
    future_ideas: List[str]
    repurposing_suggestions: dict