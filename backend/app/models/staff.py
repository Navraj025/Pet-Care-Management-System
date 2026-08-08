from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(255), nullable=False)  # e.g., "Veterinary Surgeon", "Pet Groomer"
    bio = Column(Text, nullable=True)
    working_days = Column(String(255), default="Mon,Tue,Wed,Thu,Fri,Sat")  # Comma separated
    start_time = Column(String(10), default="09:00")  # HH:MM format
    end_time = Column(String(10), default="18:00")    # HH:MM format
    break_start = Column(String(10), default="13:00") # HH:MM format
    break_end = Column(String(10), default="14:00")   # HH:MM format
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="staff_profile")
    appointments = relationship("Appointment", back_populates="staff")
    medical_records = relationship("MedicalRecord", back_populates="staff")
    vaccinations = relationship("Vaccination", back_populates="staff")
    availabilities = relationship("Availability", back_populates="staff", cascade="all, delete-orphan")
