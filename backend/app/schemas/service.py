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
    business_id: Optional[int] = None


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None
    business_id: Optional[int] = None


class ServiceOut(ServiceBase):
    id: int
    business_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UniqueServiceOut(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    min_price: float
    max_price: float
    default_duration: int
    business_count: int

