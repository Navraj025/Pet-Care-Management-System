from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.deps import require_roles
from app.models.user import User, UserRole
from app.models.business import Business, BusinessStatus
from app.models.service import Service
from app.models.staff import Staff
from app.models.appointment import Appointment
from app.models.review import Review
from app.schemas.business import BusinessStatusUpdate

router = APIRouter(prefix="/admin/businesses", tags=["Admin Business Management"])


@router.get("")
def admin_list_businesses(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    type_filter: Optional[str] = None,
    city_filter: Optional[str] = None,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    query = db.query(Business)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Business.name.ilike(s)) |
            (Business.city.ilike(s)) |
            (Business.email.ilike(s)) |
            (Business.phone.ilike(s))
        )

    if status_filter and status_filter != "All":
        query = query.filter(Business.status == status_filter)

    if type_filter and type_filter != "All":
        query = query.filter(Business.business_type == type_filter)

    if city_filter and city_filter != "All":
        query = query.filter(Business.city.ilike(f"%{city_filter.strip()}%"))

    businesses = query.order_by(Business.created_at.desc()).all()
    results = []

    for b in businesses:
        owner = b.owner
        services_count = db.query(Service).filter(Service.business_id == b.id).count()
        staff_count = db.query(Staff).filter(Staff.business_id == b.id).count()
        appt_count = db.query(Appointment).filter(Appointment.business_id == b.id).count()
        reviews = db.query(Review).filter(Review.business_id == b.id).all()
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 5.0

        results.append({
            "id": b.id,
            "name": b.name,
            "slug": b.slug,
            "business_type": b.business_type,
            "logo_url": b.logo_url,
            "cover_image_url": b.cover_image_url,
            "description": b.description,
            "phone": b.phone,
            "email": b.email,
            "address": b.address,
            "city": b.city,
            "state": b.state,
            "pincode": b.pincode,
            "opening_time": b.opening_time,
            "closing_time": b.closing_time,
            "working_days": b.working_days,
            "status": b.status.value,
            "created_at": b.created_at.strftime("%Y-%m-%d"),
            "owner": {
                "id": owner.id if owner else None,
                "full_name": owner.full_name if owner else "Unknown",
                "email": owner.email if owner else "",
                "phone": owner.phone if owner else ""
            },
            "stats": {
                "services_count": services_count,
                "staff_count": staff_count,
                "appointments_count": appt_count,
                "avg_rating": avg_rating,
                "review_count": len(reviews)
            }
        })

    return results


@router.get("/{business_id}")
def admin_get_business_detail(
    business_id: int,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    owner = b.owner
    services = db.query(Service).filter(Service.business_id == b.id).all()
    staff_members = db.query(Staff).filter(Staff.business_id == b.id).all()
    appointments = db.query(Appointment).filter(Appointment.business_id == b.id).all()
    reviews = db.query(Review).filter(Review.business_id == b.id).all()

    return {
        "id": b.id,
        "name": b.name,
        "slug": b.slug,
        "business_type": b.business_type,
        "logo_url": b.logo_url,
        "cover_image_url": b.cover_image_url,
        "description": b.description,
        "phone": b.phone,
        "email": b.email,
        "address": b.address,
        "city": b.city,
        "state": b.state,
        "pincode": b.pincode,
        "opening_time": b.opening_time,
        "closing_time": b.closing_time,
        "working_days": b.working_days,
        "status": b.status.value,
        "created_at": b.created_at.strftime("%Y-%m-%d %H:%M"),
        "owner": {
            "id": owner.id if owner else None,
            "full_name": owner.full_name if owner else "Unknown",
            "email": owner.email if owner else "",
            "phone": owner.phone if owner else ""
        },
        "services": [{"id": s.id, "name": s.name, "category": s.category, "price": s.price, "is_active": s.is_active} for s in services],
        "staff": [{"id": st.id, "name": st.user.full_name if st.user else "Staff", "specialization": st.specialization} for st in staff_members],
        "appointments_count": len(appointments),
        "reviews_count": len(reviews)
    }


@router.post("/{business_id}/status")
def admin_update_business_status(
    business_id: int,
    payload: BusinessStatusUpdate,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    b.status = payload.status
    db.commit()
    db.refresh(b)

    return {
        "message": f"Business '{b.name}' status updated to {b.status.value}",
        "business_id": b.id,
        "status": b.status.value
    }


@router.post("/{business_id}/approve")
def admin_approve_business(
    business_id: int,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    b.status = BusinessStatus.APPROVED
    db.commit()
    return {"message": f"Business '{b.name}' has been approved and is now live on the marketplace.", "status": b.status.value}


@router.post("/{business_id}/reject")
def admin_reject_business(
    business_id: int,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    b.status = BusinessStatus.REJECTED
    db.commit()
    return {"message": f"Business '{b.name}' registration has been rejected.", "status": b.status.value}


@router.post("/{business_id}/suspend")
def admin_suspend_business(
    business_id: int,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    b.status = BusinessStatus.SUSPENDED
    db.commit()
    return {"message": f"Business '{b.name}' has been suspended.", "status": b.status.value}


@router.post("/{business_id}/reactivate")
def admin_reactivate_business(
    business_id: int,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    b.status = BusinessStatus.APPROVED
    db.commit()
    return {"message": f"Business '{b.name}' has been reactivated.", "status": b.status.value}
