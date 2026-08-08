from datetime import datetime, date as date_type
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.staff import StaffOut


class MedicalRecordBase(BaseModel):
    pet_id: int
    appointment_id: Optional[int] = None
    date: date_type = Field(default_factory=date_type.today)
    symptoms: Optional[str] = None
    diagnosis: str
    treatment: str
    prescription: Optional[str] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    follow_up_date: Optional[date_type] = None
    notes: Optional[str] = None


class MedicalRecordCreate(MedicalRecordBase):
    staff_id: Optional[int] = None


class MedicalRecordUpdate(BaseModel):
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescription: Optional[str] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    follow_up_date: Optional[date_type] = None
    notes: Optional[str] = None


class MedicalRecordOut(MedicalRecordBase):
    id: int
    staff_id: Optional[int] = None
    created_at: datetime
    staff: Optional[StaffOut] = None

    class Config:
        from_attributes = True
