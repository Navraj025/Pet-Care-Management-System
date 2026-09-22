from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # Veterinary, Grooming, Vaccination, Dental, etc.
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=30)  # appointment duration in minutes
    price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    business = relationship("Business", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")
    reviews = relationship("Review", back_populates="service")
