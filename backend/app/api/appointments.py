from datetime import datetime, date, time, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.pet import Pet
from app.models.staff import Staff
from app.models.service import Service
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.invoice import Invoice
from app.models.notification import Notification
from app.schemas.appointment import (
    AppointmentOut, AppointmentCreate, AppointmentUpdateStatus, AppointmentReschedule
)
from app.services.availability_engine import calculate_available_slots
from app.services.audit_service import log_audit_action
from app.auth.deps import get_current_user, require_roles

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("", response_model=List[AppointmentOut])
def list_appointments(
    customer_id: Optional[int] = None,
    staff_id: Optional[int] = None,
    pet_id: Optional[int] = None,
    status: Optional[AppointmentStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment)

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            return []
        query = query.filter(Appointment.customer_id == current_user.customer_profile.id)
    elif current_user.role == UserRole.STAFF:
        if current_user.staff_profile:
            query = query.filter(Appointment.staff_id == current_user.staff_profile.id)
    else: # ADMIN can filter by specific params
        if customer_id:
            query = query.filter(Appointment.customer_id == customer_id)
        if staff_id:
            query = query.filter(Appointment.staff_id == staff_id)

    if pet_id:
        query = query.filter(Appointment.pet_id == pet_id)
    if status:
        query = query.filter(Appointment.status == status)
    if date_from:
        query = query.filter(Appointment.appointment_date >= date_from)
    if date_to:
        query = query.filter(Appointment.appointment_date <= date_to)

    return query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.asc()).all()


@router.post("", response_model=AppointmentOut)
def create_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine Customer ID
    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            raise HTTPException(status_code=400, detail="Customer profile missing")
        target_customer_id = current_user.customer_profile.id
    else:
        if not data.customer_id:
            raise HTTPException(status_code=400, detail="customer_id required for admin/staff")
        target_customer_id = data.customer_id

    # Verify Pet, Staff, Service exist
    pet = db.query(Pet).filter(Pet.id == data.pet_id).first()
    if not pet or pet.customer_id != target_customer_id:
        raise HTTPException(status_code=400, detail="Invalid pet selection")

    staff = db.query(Staff).filter(Staff.id == data.staff_id).first()
    if not staff or not staff.is_available:
        raise HTTPException(status_code=400, detail="Staff member is not available")

    service = db.query(Service).filter(Service.id == data.service_id).first()
    if not service or not service.is_active:
        raise HTTPException(status_code=400, detail="Selected service is inactive")

    # Double Booking Prevention Check using Availability Engine
    available_slots = calculate_available_slots(db, data.staff_id, data.service_id, data.appointment_date)
    matching_slot = next((s for s in available_slots if s.time == data.start_time), None)

    if not matching_slot or not matching_slot.available:
        raise HTTPException(
            status_code=400,
            detail=f"The time slot {data.start_time} on {data.appointment_date} is no longer available."
        )

    # Calculate End Time
    sh, sm = map(int, data.start_time.split(":"))
    start_dt = datetime.combine(data.appointment_date, time(sh, sm))
    end_dt = start_dt + timedelta(minutes=service.duration_minutes)
    end_time_str = end_dt.strftime("%H:%M")

    # Create Appointment
    appt = Appointment(
        customer_id=target_customer_id,
        pet_id=data.pet_id,
        staff_id=data.staff_id,
        service_id=data.service_id,
        appointment_date=data.appointment_date,
        start_time=data.start_time,
        end_time=end_time_str,
        status=AppointmentStatus.CONFIRMED if current_user.role in [UserRole.ADMIN, UserRole.STAFF] else AppointmentStatus.PENDING,
        notes=data.notes
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    # Initialize Payment Record
    tax = round(service.price * 0.05, 2) # 5% tax
    final_amount = round(service.price + tax, 2)
    
    payment = Payment(
        appointment_id=appt.id,
        amount=service.price,
        tax=tax,
        discount=0.0,
        final_amount=final_amount,
        status=PaymentStatus.PENDING,
        payment_method=PaymentMethod.ONLINE_MOCK
    )
    db.add(payment)

    # Add In-App Notification
    cust_user_id = pet.customer.user_id
    notif = Notification(
        user_id=cust_user_id,
        title="Appointment Requested",
        message=f"Appointment for {pet.name} ({service.name}) on {appt.appointment_date} at {appt.start_time} has been scheduled.",
        type="APPOINTMENT",
        link=f"/customer/appointments"
    )
    db.add(notif)
    db.commit()

    log_audit_action(db, current_user.id, "CREATE_APPOINTMENT", "APPOINTMENT", appt.id, f"Booked appointment for {pet.name}")
    return appt


@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or appt.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    return appt


@router.put("/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    data: AppointmentUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or appt.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if data.status != AppointmentStatus.CANCELLED:
            raise HTTPException(status_code=400, detail="Customers can only cancel appointments")

    appt.status = data.status
    if data.cancellation_reason:
        appt.cancellation_reason = data.cancellation_reason

    # Add notification for status update
    cust_user_id = appt.customer.user_id
    notif = Notification(
        user_id=cust_user_id,
        title=f"Appointment {data.status.value.replace('_', ' ').title()}",
        message=f"Your appointment for {appt.pet.name} on {appt.appointment_date} is now {data.status.value}.",
        type="APPOINTMENT",
        link="/customer/appointments"
    )
    db.add(notif)
    db.commit()
    db.refresh(appt)
    
    log_audit_action(db, current_user.id, "UPDATE_APPOINTMENT_STATUS", "APPOINTMENT", appt.id, f"Status changed to {data.status.value}")
    return appt


@router.put("/{appointment_id}/reschedule", response_model=AppointmentOut)
def reschedule_appointment(
    appointment_id: int,
    data: AppointmentReschedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or appt.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    staff_id = data.staff_id or appt.staff_id
    service = appt.service

    # Check slot availability
    available_slots = calculate_available_slots(db, staff_id, service.id, data.appointment_date)
    matching_slot = next((s for s in available_slots if s.time == data.start_time), None)

    if not matching_slot or not matching_slot.available:
        raise HTTPException(
            status_code=400,
            detail=f"Slot {data.start_time} on {data.appointment_date} is unavailable."
        )

    sh, sm = map(int, data.start_time.split(":"))
    start_dt = datetime.combine(data.appointment_date, time(sh, sm))
    end_dt = start_dt + timedelta(minutes=service.duration_minutes)

    appt.staff_id = staff_id
    appt.appointment_date = data.appointment_date
    appt.start_time = data.start_time
    appt.end_time = end_dt.strftime("%H:%M")
    appt.status = AppointmentStatus.CONFIRMED

    db.commit()
    db.refresh(appt)

    log_audit_action(db, current_user.id, "RESCHEDULE_APPOINTMENT", "APPOINTMENT", appt.id, f"Rescheduled to {data.appointment_date} at {data.start_time}")
    return appt
