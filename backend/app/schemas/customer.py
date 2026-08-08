from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.user import UserOut


class CustomerBase(BaseModel):
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    user_id: int


class CustomerUpdate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int
    user_id: int
    created_at: datetime
    user: UserOut

    class Config:
        from_attributes = True
