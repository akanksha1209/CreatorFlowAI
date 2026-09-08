from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum

class ContentIntent(str, enum.Enum):
    EDUCATIONAL = "educational"
    ENTERTAINMENT = "entertainment"
    INSPIRATIONAL = "inspirational"
    PROMOTIONAL = "promotional"
    NEWS = "news"
    TUTORIAL = "tutorial"
    REVIEW = "review"
    COMPARISON = "comparison"

class Platform(str, enum.Enum):
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    BOTH = "both"

class FormatType(str, enum.Enum):
    SHORT_FORM = "short_form"
    LONG_FORM = "long_form"
    BOTH = "both"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    topic = Column(String, nullable=False)
    summary = Column(Text)
    content_intent = Column(SQLEnum(ContentIntent))
    target_audience = Column(Text)
    audience_reasoning = Column(Text)
    best_platform = Column(SQLEnum(Platform))
    platform_reasoning = Column(Text)
    best_format = Column(SQLEnum(FormatType))
    format_reasoning = Column(Text)
    topic_potential = Column(String)
    viral_potential_score = Column(Integer, default=0)
    viral_potential_reasoning = Column(Text)
    trend_relevance = Column(String)
    trend_reasoning = Column(Text)
    competition_level = Column(String)
    content_gap = Column(Text)
    differentiation_strategy = Column(Text)
    recommended_tone = Column(String)
    recommended_length = Column(String)
    key_points = Column(Text)
    things_to_avoid = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())