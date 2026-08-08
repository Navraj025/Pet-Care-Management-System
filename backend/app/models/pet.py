from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.database import Base


class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    species = Column(String(50), nullable=False)  # Dog, Cat, Bird, Rabbit, etc.
    breed = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=False)   # Male, Female, Neutered Male, Spayed Female
    date_of_birth = Column(Date, nullable=True)
    weight = Column(Float, nullable=True)         # in kg
    color = Column(String(50), nullable=True)
    microchip_id = Column(String(100), unique=True, nullable=True)
    allergies = Column(Text, nullable=True)
    existing_conditions = Column(Text, nullable=True)
    emergency_notes = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="pets")
    appointments = relationship("Appointment", back_populates="pet", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="pet", cascade="all, delete-orphan")
    vaccinations = relationship("Vaccination", back_populates="pet", cascade="all, delete-orphan")
