from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ServiceBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    duration_minutes: int = 30
    price: float
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None


class ServiceOut(ServiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
