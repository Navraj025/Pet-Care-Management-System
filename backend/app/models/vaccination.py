import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class VaccinationStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    UPCOMING = "UPCOMING"
    OVERDUE = "OVERDUE"


class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    
    vaccine_name = Column(String(150), nullable=False)
    date_administered = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=True)
    batch_number = Column(String(100), nullable=True)
    status = Column(Enum(VaccinationStatus), default=VaccinationStatus.COMPLETED, nullable=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    pet = relationship("Pet", back_populates="vaccinations")
    staff = relationship("Staff", back_populates="vaccinations")
