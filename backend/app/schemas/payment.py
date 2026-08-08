from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.payment import PaymentStatus, PaymentMethod


class PaymentCreate(BaseModel):
    appointment_id: int
    payment_method: PaymentMethod = PaymentMethod.ONLINE_MOCK
    card_name: Optional[str] = None # Mock field, not stored
    card_number_last4: Optional[str] = None # Mock field


class PaymentOut(BaseModel):
    id: int
    appointment_id: int
    amount: float
    tax: float
    discount: float
    final_amount: float
    status: PaymentStatus
    payment_method: PaymentMethod
    transaction_id: Optional[str] = None
    payment_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
