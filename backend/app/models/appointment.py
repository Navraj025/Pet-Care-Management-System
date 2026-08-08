import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    pet_id = Column(Integer, ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False)
    
    appointment_date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False) # e.g. "10:00"
    end_time = Column(String(10), nullable=False)   # e.g. "10:30"
    
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="appointments")
    pet = relationship("Pet", back_populates="appointments")
    staff = relationship("Staff", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    
    payment = relationship("Payment", back_populates="appointment", uselist=False, cascade="all, delete-orphan")
    invoice = relationship("Invoice", back_populates="appointment", uselist=False, cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="appointment")
    review = relationship("Review", back_populates="appointment", uselist=False)
