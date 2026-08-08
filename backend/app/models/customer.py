from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="customer_profile")
    pets = relationship("Pet", back_populates="customer", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")
