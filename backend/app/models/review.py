from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    
    rating = Column(Integer, nullable=False) # 1 to 5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    appointment = relationship("Appointment", back_populates="review")
    customer = relationship("Customer", back_populates="reviews")
    service = relationship("Service", back_populates="reviews")
