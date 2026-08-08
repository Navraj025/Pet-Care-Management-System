from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "CREATE_APPOINTMENT", "UPDATE_MEDICAL_RECORD"
    entity_type = Column(String(100), nullable=False) # e.g. "APPOINTMENT", "PET"
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
