from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.database import Base


class MedicalRecord(Base):
    __tablename__ = "pet_medical_records"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    
    date = Column(Date, default=date.today, nullable=False)
    symptoms = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=False)
    treatment = Column(Text, nullable=False)
    prescription = Column(Text, nullable=True)
    weight = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True) # in Celsius or Fahrenheit
    follow_up_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    pet = relationship("Pet", back_populates="medical_records")
    staff = relationship("Staff", back_populates="medical_records")
    appointment = relationship("Appointment", back_populates="medical_records")
