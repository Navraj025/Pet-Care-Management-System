from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="GENERAL") # APPOINTMENT, VACCINATION, PAYMENT, SYSTEM
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True) # Front-end route link
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
