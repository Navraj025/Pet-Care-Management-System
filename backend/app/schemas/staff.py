from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserOut, UserCreate


class StaffBase(BaseModel):
    specialization: str
    bio: Optional[str] = None
    working_days: str = "Mon,Tue,Wed,Thu,Fri,Sat"
    start_time: str = "09:00"
    end_time: str = "18:00"
    break_start: str = "13:00"
    break_end: str = "14:00"
    is_available: bool = True


class StaffCreate(StaffBase):
    user_id: Optional[int] = None
    user_data: Optional[UserCreate] = None # When admin creates new staff from scratch


class StaffUpdate(BaseModel):
    specialization: Optional[str] = None
    bio: Optional[str] = None
    working_days: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    break_start: Optional[str] = None
    break_end: Optional[str] = None
    is_available: Optional[bool] = None


class StaffOut(StaffBase):
    id: int
    user_id: int
    created_at: datetime
    user: UserOut

    class Config:
        from_attributes = True
