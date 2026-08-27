from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class AppointmentService(Base):
    __tablename__ = "appointment_services"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False)
    
    price_at_booking = Column(Float, nullable=False)
    duration_minutes = Column(Integer, default=30, nullable=False)

    # Relationships
    appointment = relationship("Appointment", back_populates="appointment_services")
    service = relationship("Service")
