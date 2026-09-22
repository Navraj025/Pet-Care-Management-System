from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.business import BusinessStatus, BusinessType


class ServiceOutSummary(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    is_active: bool

    class Config:
        from_attributes = True


class BusinessBase(BaseModel):
    name: str
    business_type: str = "Pet Care Center"
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_time: str = "09:00"
    closing_time: str = "18:00"
    working_days: str = "Mon,Tue,Wed,Thu,Fri,Sat"


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    business_type: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    working_days: Optional[str] = None


class BusinessStatusUpdate(BaseModel):
    status: BusinessStatus


class BusinessOut(BusinessBase):
    id: int
    owner_id: int
    slug: str
    status: BusinessStatus
    created_at: datetime
    updated_at: datetime
    
    # Aggregates
    rating: float = 5.0
    review_count: int = 0
    service_count: int = 0
    services: List[ServiceOutSummary] = []

    class Config:
        from_attributes = True


class BusinessMarketplaceCard(BaseModel):
    id: int
    name: str
    slug: str
    business_type: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    rating: float
    review_count: int
    service_count: int
    opening_time: str
    closing_time: str
    working_days: str
    status: str

    class Config:
        from_attributes = True


class BusinessComparisonCard(BaseModel):
    id: int
    name: str
    slug: str
    business_type: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    rating: float
    review_count: int
    
    # Service comparison specifics
    offered_services: List[ServiceOutSummary] = []
    missing_services: List[str] = []
    is_fully_available: bool = True
    total_price: float
    formatted_total_price: str
    duration_minutes: int
    distance_km: float
    next_available_slot: str
    
    # Badges
    is_best_price: bool = False
    is_best_rated: bool = False
    is_nearest: bool = False
    is_earliest_available: bool = False
    is_best_overall: bool = False

    class Config:
        from_attributes = True
