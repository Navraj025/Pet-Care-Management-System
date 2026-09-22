import re
from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth.deps import require_roles, get_current_user
from app.models.user import User, UserRole
from app.models.business import Business, BusinessStatus
from app.models.service import Service
from app.models.staff import Staff
from app.models.appointment import Appointment, AppointmentStatus
from app.models.customer import Customer
from app.models.pet import Pet
from app.models.review import Review
from app.models.payment import Payment, PaymentStatus
from app.models.invoice import Invoice
from app.schemas.business import BusinessUpdate

router = APIRouter(prefix="/business-owner", tags=["Business Owner Portal"])


def get_current_business(current_user: User = Depends(require_roles(["BUSINESS_OWNER"])), db: Session = Depends(get_db)) -> Business:
    """Helper dependency to retrieve and validate the logged-in Business Owner's business."""
    business = db.query(Business).filter(Business.owner_id == current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registered business profile found for this user account. Please complete business registration."
        )
    return business


# 1. DASHBOARD OVERVIEW & STATS
@router.get("/dashboard-stats")
def get_business_dashboard_stats(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    total_appointments = db.query(Appointment).filter(Appointment.business_id == business.id).count()
    pending_appointments = db.query(Appointment).filter(
        Appointment.business_id == business.id,
        Appointment.status == AppointmentStatus.PENDING
    ).count()
    confirmed_appointments = db.query(Appointment).filter(
        Appointment.business_id == business.id,
        Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED])
    ).count()

    total_revenue = db.query(func.sum(Payment.final_amount)).filter(
        Payment.business_id == business.id,
        Payment.status == PaymentStatus.PAID
    ).scalar() or 0.0

    services_count = db.query(Service).filter(Service.business_id == business.id).count()
    staff_count = db.query(Staff).filter(Staff.business_id == business.id).count()

    reviews = db.query(Review).filter(Review.business_id == business.id).all()
    avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 5.0

    # Recent Appointments
    recent_appts = db.query(Appointment).filter(Appointment.business_id == business.id).order_by(Appointment.created_at.desc()).limit(5).all()
    recent_data = []
    for a in recent_appts:
        recent_data.append({
            "id": a.id,
            "customer_name": a.customer.user.full_name if a.customer and a.customer.user else "Customer",
            "pet_name": a.pet.name if a.pet else "Pet",
            "service_name": a.service.name if a.service else "Service",
            "date": a.appointment_date.strftime("%Y-%m-%d"),
            "time": a.start_time,
            "status": a.status.value
        })

    return {
        "business": {
            "id": business.id,
            "name": business.name,
            "slug": business.slug,
            "status": business.status.value,
            "business_type": business.business_type
        },
        "stats": {
            "total_appointments": total_appointments,
            "pending_appointments": pending_appointments,
            "confirmed_appointments": confirmed_appointments,
            "total_revenue_inr": round(total_revenue, 2),
            "services_count": services_count,
            "staff_count": staff_count,
            "avg_rating": avg_rating,
            "review_count": len(reviews)
        },
        "recent_appointments": recent_data
    }


# 2. BUSINESS PROFILE MANAGEMENT
@router.get("/profile")
def get_business_profile(business: Business = Depends(get_current_business)):
    return {
        "id": business.id,
        "name": business.name,
        "slug": business.slug,
        "logo_url": business.logo_url,
        "cover_image_url": business.cover_image_url,
        "description": business.description,
        "business_type": business.business_type,
        "phone": business.phone,
        "email": business.email,
        "address": business.address,
        "city": business.city,
        "state": business.state,
        "pincode": business.pincode,
        "opening_time": business.opening_time,
        "closing_time": business.closing_time,
        "working_days": business.working_days,
        "status": business.status.value
    }


@router.put("/profile")
def update_business_profile(
    payload: BusinessUpdate,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    update_data = payload.dict(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        # Update slug if name changes
        slug = re.sub(r'[^a-z0-9]+', '-', update_data["name"].lower()).strip('-')
        business.slug = f"{slug}-{business.id}"

    for key, val in update_data.items():
        if val is not None:
            setattr(business, key, val)

    db.commit()
    db.refresh(business)
    return {"message": "Business profile updated successfully", "business": business}


# 3. SERVICE MANAGEMENT
@router.get("/services")
def list_business_services(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    services = db.query(Service).filter(Service.business_id == business.id).all()
    return services


@router.post("/services")
def create_business_service(
    name: str,
    category: str,
    price: float,
    duration_minutes: int = 30,
    description: Optional[str] = None,
    is_active: bool = True,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    srv = Service(
        business_id=business.id,
        name=name.strip(),
        category=category.strip(),
        price=price,
        duration_minutes=duration_minutes,
        description=description.strip() if description else None,
        is_active=is_active
    )
    db.add(srv)
    db.commit()
    db.refresh(srv)
    return srv


@router.put("/services/{service_id}")
def update_business_service(
    service_id: int,
    name: Optional[str] = None,
    category: Optional[str] = None,
    price: Optional[float] = None,
    duration_minutes: Optional[int] = None,
    description: Optional[str] = None,
    is_active: Optional[bool] = None,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    srv = db.query(Service).filter(Service.id == service_id, Service.business_id == business.id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found or unauthorized")

    if name is not None: srv.name = name.strip()
    if category is not None: srv.category = category.strip()
    if price is not None: srv.price = price
    if duration_minutes is not None: srv.duration_minutes = duration_minutes
    if description is not None: srv.description = description.strip()
    if is_active is not None: srv.is_active = is_active

    db.commit()
    db.refresh(srv)
    return srv


@router.delete("/services/{service_id}")
def delete_business_service(
    service_id: int,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    srv = db.query(Service).filter(Service.id == service_id, Service.business_id == business.id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found or unauthorized")

    db.delete(srv)
    db.commit()
    return {"message": "Service deleted successfully"}


# 4. STAFF MANAGEMENT
@router.get("/staff")
def list_business_staff(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    staff_members = db.query(Staff).filter(Staff.business_id == business.id).all()
    results = []
    for st in staff_members:
        results.append({
            "id": st.id,
            "user_id": st.user_id,
            "name": st.user.full_name if st.user else "Staff",
            "email": st.user.email if st.user else "",
            "phone": st.user.phone if st.user else "",
            "specialization": st.specialization,
            "bio": st.bio,
            "working_days": st.working_days,
            "start_time": st.start_time,
            "end_time": st.end_time,
            "is_available": st.is_available
        })
    return results


# 5. APPOINTMENTS MANAGEMENT
@router.get("/appointments")
def list_business_appointments(
    status_filter: Optional[str] = None,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment).filter(Appointment.business_id == business.id)

    if status_filter and status_filter != "All":
        query = query.filter(Appointment.status == status_filter)

    appts = query.order_by(Appointment.appointment_date.desc()).all()
    results = []

    for a in appts:
        services_list = []
        if a.appointment_services:
            for srv in a.appointment_services:
                services_list.append({
                    "id": srv.service_id,
                    "name": srv.service.name if srv.service else "Service",
                    "price": srv.price_at_booking
                })
        elif a.service:
            services_list.append({
                "id": a.service.id,
                "name": a.service.name,
                "price": a.service.price
            })

        total_amount = a.invoice.total_amount if a.invoice else (a.payment.final_amount if a.payment else sum(s["price"] for s in services_list))

        results.append({
            "id": a.id,
            "customer_name": a.customer.user.full_name if a.customer and a.customer.user else "Customer",
            "customer_phone": a.customer.user.phone if a.customer and a.customer.user else "",
            "pet_name": a.pet.name if a.pet else "Pet",
            "pet_breed": a.pet.breed if a.pet else "",
            "staff_name": a.staff.user.full_name if a.staff and a.staff.user else "Staff",
            "services": services_list,
            "date": a.appointment_date.strftime("%Y-%m-%d"),
            "start_time": a.start_time,
            "end_time": a.end_time,
            "status": a.status.value,
            "total_amount_inr": total_amount,
            "notes": a.notes
        })

    return results


@router.put("/appointments/{appointment_id}/status")
def update_business_appointment_status(
    appointment_id: int,
    status_val: str,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.business_id == business.id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found or unauthorized")

    appt.status = status_val
    db.commit()
    return {"message": "Appointment status updated", "status": appt.status.value}


# 6. REVIEWS MANAGEMENT
@router.get("/reviews")
def list_business_reviews(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(Review.business_id == business.id).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        results.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "customer_name": r.customer.user.full_name if r.customer and r.customer.user else "Anonymous",
            "service_name": r.service.name if r.service else "Service",
            "created_at": r.created_at.strftime("%Y-%m-%d")
        })
    return results


# 7. PAYMENTS & FINANCIAL REPORTS
@router.get("/payments")
def list_business_payments(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    payments = db.query(Payment).filter(Payment.business_id == business.id).order_by(Payment.created_at.desc()).all()
    results = []
    for p in payments:
        results.append({
            "id": p.id,
            "appointment_id": p.appointment_id,
            "amount": p.amount,
            "tax": p.tax,
            "final_amount": p.final_amount,
            "status": p.status.value,
            "payment_method": p.payment_method.value,
            "transaction_id": p.transaction_id,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results
