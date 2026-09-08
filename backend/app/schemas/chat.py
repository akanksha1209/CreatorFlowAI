from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    project_id: int
    message: str = Field(..., min_length=1, max_length=1000)
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    updated_content: Optional[dict] = None