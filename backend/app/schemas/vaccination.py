from datetime import datetime, date as date_type
from typing import Optional
from pydantic import BaseModel
from app.models.vaccination import VaccinationStatus
from app.schemas.staff import StaffOut


class VaccinationBase(BaseModel):
    pet_id: int
    vaccine_name: str
    date_administered: date_type
    next_due_date: Optional[date_type] = None
    batch_number: Optional[str] = None
    status: VaccinationStatus = VaccinationStatus.COMPLETED
    notes: Optional[str] = None


class VaccinationCreate(VaccinationBase):
    staff_id: Optional[int] = None


class VaccinationUpdate(BaseModel):
    vaccine_name: Optional[str] = None
    date_administered: Optional[date_type] = None
    next_due_date: Optional[date_type] = None
    batch_number: Optional[str] = None
    status: Optional[VaccinationStatus] = None
    notes: Optional[str] = None


class VaccinationOut(VaccinationBase):
    id: int
    staff_id: Optional[int] = None
    created_at: datetime
    staff: Optional[StaffOut] = None

    class Config:
        from_attributes = True
