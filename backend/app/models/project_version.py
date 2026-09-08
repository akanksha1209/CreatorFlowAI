from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class ProjectVersion(Base):
    __tablename__ = "project_versions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    version_number = Column(Integer, default=1)
    title = Column(Text)
    hook = Column(Text)
    script = Column(Text)
    caption = Column(Text)
    cta = Column(Text)
    hashtags = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )