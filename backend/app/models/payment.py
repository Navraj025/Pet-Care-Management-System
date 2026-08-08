import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"
    UPI = "UPI"
    CASH = "CASH"
    ONLINE_MOCK = "ONLINE_MOCK"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    amount = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)
    
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.ONLINE_MOCK, nullable=False)
    transaction_id = Column(String(100), unique=True, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    appointment = relationship("Appointment", back_populates="payment")
    invoice = relationship("Invoice", back_populates="payment", uselist=False)
