from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"), unique=True, nullable=True)
    
    invoice_number = Column(String(100), unique=True, nullable=False) # e.g. INV-2026-0001
    issue_date = Column(Date, default=date.today, nullable=False)
    due_date = Column(Date, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    appointment = relationship("Appointment", back_populates="invoice")
    payment = relationship("Payment", back_populates="invoice")
