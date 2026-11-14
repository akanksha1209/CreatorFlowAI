from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class ProjectVersion(Base):
    __tablename__ = "project_versions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    version_number = Column(Integer, default=1)
    titles = Column(Text, nullable=True)
    hooks = Column(Text, nullable=True)
    # Kept for compatibility with records created by the first schema.
    title = Column(Text, nullable=True)
    hook = Column(Text, nullable=True)
    script = Column(Text)
    caption = Column(Text)
    cta = Column(Text)
    hashtags = Column(Text)
    alternative_angles = Column(Text, nullable=True)
    future_ideas = Column(Text, nullable=True)
    repurposing_suggestions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
