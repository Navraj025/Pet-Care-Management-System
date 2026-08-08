from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from app.schemas.appointment import AppointmentOut
from app.schemas.payment import PaymentOut


class InvoiceOut(BaseModel):
    id: int
    appointment_id: int
    payment_id: Optional[int] = None
    invoice_number: str
    issue_date: date
    due_date: date
    total_amount: float
    created_at: datetime
    
    appointment: Optional[AppointmentOut] = None
    payment: Optional[PaymentOut] = None

    class Config:
        from_attributes = True
