from sqlalchemy import Column, Integer, DateTime, Text, ForeignKey, String, Boolean
from sqlalchemy.sql import func
from app.database import Base

class GeneratedContent(Base):
    __tablename__ = "generated_content"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    content_type = Column(String, nullable=False)  # title, hook, script, etc.
    content_value = Column(Text, nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())