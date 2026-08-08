from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.models.review import Review
from app.schemas.review import ReviewOut, ReviewCreate
from app.auth.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=List[ReviewOut])
def list_reviews(
    service_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    if service_id:
        query = query.filter(Review.service_id == service_id)
    return query.order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewOut)
def submit_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CUSTOMER or not current_user.customer_profile:
        raise HTTPException(status_code=403, detail="Only customers can submit reviews")

    appt = db.query(Appointment).filter(Appointment.id == data.appointment_id).first()
    if not appt or appt.customer_id != current_user.customer_profile.id:
        raise HTTPException(status_code=400, detail="Invalid appointment selection")

    if appt.status != AppointmentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review completed appointments")

    existing = db.query(Review).filter(Review.appointment_id == data.appointment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this appointment")

    review = Review(
        appointment_id=data.appointment_id,
        customer_id=current_user.customer_profile.id,
        service_id=appt.service_id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
