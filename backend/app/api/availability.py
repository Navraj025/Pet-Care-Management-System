from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.availability import Availability
from app.schemas.availability import TimeSlot, AvailabilityOut, AvailabilityCreate
from app.services.availability_engine import calculate_available_slots
from app.auth.deps import get_current_user, require_roles

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.get("/slots", response_model=List[TimeSlot])
def get_available_time_slots(
    staff_id: int = Query(...),
    service_id: int = Query(...),
    target_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """Dynamically calculates non-conflicting time slots for a given staff, service & date."""
    return calculate_available_slots(db, staff_id, service_id, target_date)


@router.post("", response_model=AvailabilityOut)
def set_staff_custom_availability(
    data: AvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"]))
):
    if current_user.role == "STAFF":
        if not current_user.staff_profile or current_user.staff_profile.id != data.staff_id:
            raise HTTPException(status_code=403, detail="Not authorized to set availability for other staff")

    existing = db.query(Availability).filter(
        Availability.staff_id == data.staff_id,
        Availability.date == data.date
    ).first()

    if existing:
        existing.is_available = data.is_available
        existing.start_time = data.start_time
        existing.end_time = data.end_time
        existing.reason = data.reason
        db.commit()
        db.refresh(existing)
        return existing

    avail = Availability(
        staff_id=data.staff_id,
        date=data.date,
        is_available=data.is_available,
        start_time=data.start_time,
        end_time=data.end_time,
        reason=data.reason
    )
    db.add(avail)
    db.commit()
    db.refresh(avail)
    return avail
