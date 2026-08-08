from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.customer import CustomerOut
from app.schemas.service import ServiceOut


class ReviewCreate(BaseModel):
    appointment_id: int
    rating: int # 1..5
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    appointment_id: int
    customer_id: int
    service_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    
    customer: Optional[CustomerOut] = None
    service: Optional[ServiceOut] = None

    class Config:
        from_attributes = True
