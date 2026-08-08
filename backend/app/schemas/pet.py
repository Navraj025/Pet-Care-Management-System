from datetime import datetime, date as date_type
from typing import Optional, List
from pydantic import BaseModel


class PetBase(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    gender: str
    date_of_birth: Optional[date_type] = None
    weight: Optional[float] = None
    color: Optional[str] = None
    microchip_id: Optional[str] = None
    allergies: Optional[str] = None
    existing_conditions: Optional[str] = None
    emergency_notes: Optional[str] = None
    avatar_url: Optional[str] = None


class PetCreate(PetBase):
    customer_id: Optional[int] = None


class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date_type] = None
    weight: Optional[float] = None
    color: Optional[str] = None
    microchip_id: Optional[str] = None
    allergies: Optional[str] = None
    existing_conditions: Optional[str] = None
    emergency_notes: Optional[str] = None
    avatar_url: Optional[str] = None


class PetOut(PetBase):
    id: int
    customer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
