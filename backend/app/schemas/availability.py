from datetime import datetime, date as date_type
from typing import Optional, List
from pydantic import BaseModel


class AvailabilityBase(BaseModel):
    staff_id: int
    date: date_type
    is_available: bool = True
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reason: Optional[str] = None


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityOut(AvailabilityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TimeSlot(BaseModel):
    time: str
    available: bool
    reason: Optional[str] = None
