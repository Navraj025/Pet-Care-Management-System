from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    is_available = Column(Boolean, default=True)  # True = working, False = leave/off
    start_time = Column(String(10), nullable=True) # Override start time if specific
    end_time = Column(String(10), nullable=True)   # Override end time if specific
    reason = Column(String(255), nullable=True)     # e.g., "Sick leave", "Custom shift"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    staff = relationship("Staff", back_populates="availabilities")
