from sqlalchemy import Column, Integer, DateTime, Text, ForeignKey, String
from sqlalchemy.sql import func
from app.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    message_type = Column(String, nullable=False)  # user or ai
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())