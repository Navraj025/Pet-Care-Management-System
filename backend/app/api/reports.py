from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.customer import Customer
from app.models.pet import Pet
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus
from app.models.service import Service
from app.schemas.report import (
    DashboardKpi, ReportSummary, RevenueTrend, AppointmentStatusCount, ServicePopularity
)
from app.auth.deps import require_roles

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/summary", response_model=ReportSummary)
def get_report_summary(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    today = date.today()
    month_start = today.replace(day=1)

    total_customers = db.query(Customer).count()
    total_pets = db.query(Pet).count()
    
    today_appts = db.query(Appointment).filter(Appointment.appointment_date == today).count()
    upcoming_appts = db.query(Appointment).filter(
        Appointment.appointment_date >= today,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
    ).count()

    today_rev_query = db.query(func.sum(Payment.final_amount)).filter(
        Payment.status == PaymentStatus.PAID,
        func.date(Payment.payment_date) == today
    ).scalar() or 0.0

    month_rev_query = db.query(func.sum(Payment.final_amount)).filter(
        Payment.status == PaymentStatus.PAID,
        func.date(Payment.payment_date) >= month_start
    ).scalar() or 0.0

    # Fallback to trailing 30 days if current calendar month has zero recorded revenue
    if month_rev_query == 0.0:
        month_rev_query = db.query(func.sum(Payment.final_amount)).filter(
            Payment.status == PaymentStatus.PAID,
            func.date(Payment.payment_date) >= (today - timedelta(days=30))
        ).scalar() or 0.0
    
    # Fallback to total revenue if still 0.0 but paid payments exist
    if month_rev_query == 0.0:
        month_rev_query = db.query(func.sum(Payment.final_amount)).filter(
            Payment.status == PaymentStatus.PAID
        ).scalar() or 0.0

    pending_payments_val = db.query(func.sum(Payment.final_amount)).filter(
        Payment.status == PaymentStatus.PENDING
    ).scalar() or 0.0

    cancelled_count = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.CANCELLED
    ).count()

    kpis = DashboardKpi(
        total_customers=total_customers,
        total_pets=total_pets,
        today_appointments=today_appts,
        upcoming_appointments=upcoming_appts,
        today_revenue=round(float(today_rev_query), 2),
        monthly_revenue=round(float(month_rev_query), 2),
        pending_payments=round(float(pending_payments_val), 2),
        cancelled_appointments=cancelled_count
    )

    # 1. Revenue Trends by Date (Last 30 days or filtered)
    start_filter = date_from or (today - timedelta(days=30))
    end_filter = date_to or today

    rev_rows = db.query(
        func.date(Payment.payment_date).label("pdate"),
        func.sum(Payment.final_amount).label("tot_rev"),
        func.count(Payment.id).label("cnt")
    ).filter(
        Payment.status == PaymentStatus.PAID,
        Payment.payment_date.isnot(None),
        func.date(Payment.payment_date) >= start_filter,
        func.date(Payment.payment_date) <= end_filter
    ).group_by(func.date(Payment.payment_date)).order_by(func.date(Payment.payment_date)).all()

    # If no records in trailing 30 days, load the latest 14 payment dates so charts are populated
    if not rev_rows and not date_from:
        rev_rows = db.query(
            func.date(Payment.payment_date).label("pdate"),
            func.sum(Payment.final_amount).label("tot_rev"),
            func.count(Payment.id).label("cnt")
        ).filter(
            Payment.status == PaymentStatus.PAID,
            Payment.payment_date.isnot(None)
        ).group_by(func.date(Payment.payment_date)).order_by(func.date(Payment.payment_date).desc()).limit(14).all()
        rev_rows.reverse()

    rev_trends = [
        RevenueTrend(date=str(row.pdate), revenue=round(float(row.tot_rev), 2), count=row.cnt)
        for row in rev_rows
    ]

    # 2. Appointment Status Distribution
    status_rows = db.query(
        Appointment.status,
        func.count(Appointment.id).label("cnt")
    ).group_by(Appointment.status).all()

    status_dist = [
        AppointmentStatusCount(status=row.status.value, count=row.cnt)
        for row in status_rows
    ]

    # 3. Service Popularity - Group by Service Name & Category to eliminate duplicates across clinics
    from app.models.appointment_service import AppointmentService

    service_rows = db.query(
        Service.name,
        Service.category,
        func.count(AppointmentService.id).label("cnt"),
        func.coalesce(func.sum(AppointmentService.price_at_booking), 0.0).label("tot_rev")
    ).join(AppointmentService, Service.id == AppointmentService.service_id)\
     .group_by(Service.name, Service.category)\
     .order_by(func.count(AppointmentService.id).desc()).limit(6).all()

    popular_services = [
        ServicePopularity(
            service_name=row.name,
            category=row.category,
            bookings_count=row.cnt,
            total_revenue=round(float(row.tot_rev), 2)
        )
        for row in service_rows
    ]

    return ReportSummary(
        kpis=kpis,
        revenue_trends=rev_trends,
        appointment_statuses=status_dist,
        popular_services=popular_services
    )
