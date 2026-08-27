from datetime import datetime, date as date_type
from typing import Optional, List
from pydantic import BaseModel
from app.models.appointment import AppointmentStatus
from app.schemas.pet import PetOut
from app.schemas.staff import StaffOut
from app.schemas.service import ServiceOut
from app.schemas.customer import CustomerOut


class AppointmentServiceOut(BaseModel):
    id: int
    appointment_id: int
    service_id: int
    price_at_booking: float
    duration_minutes: int
    service: Optional[ServiceOut] = None

    class Config:
        from_attributes = True


class AppointmentBase(BaseModel):
    pet_id: int
    staff_id: int
    service_id: Optional[int] = None
    service_ids: Optional[List[int]] = None
    appointment_date: date_type
    start_time: str # "10:00"
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    customer_id: Optional[int] = None


class AppointmentUpdateStatus(BaseModel):
    status: AppointmentStatus
    cancellation_reason: Optional[str] = None


class AppointmentReschedule(BaseModel):
    appointment_date: date_type
    start_time: str
    staff_id: Optional[int] = None


class AppointmentOut(BaseModel):
    id: int
    customer_id: int
    pet_id: int
    staff_id: int
    service_id: Optional[int] = None
    appointment_date: date_type
    start_time: str
    end_time: str
    status: AppointmentStatus
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    pet: Optional[PetOut] = None
    staff: Optional[StaffOut] = None
    service: Optional[ServiceOut] = None
    customer: Optional[CustomerOut] = None
    appointment_services: List[AppointmentServiceOut] = []

    class Config:
        from_attributes = True
