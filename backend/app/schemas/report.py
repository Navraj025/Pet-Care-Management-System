from typing import List, Dict, Any
from pydantic import BaseModel


class DashboardKpi(BaseModel):
    total_customers: int
    total_pets: int
    today_appointments: int
    upcoming_appointments: int
    today_revenue: float
    monthly_revenue: float
    pending_payments: float
    cancelled_appointments: int


class RevenueTrend(BaseModel):
    date: str
    revenue: float
    count: int


class AppointmentStatusCount(BaseModel):
    status: str
    count: int


class ServicePopularity(BaseModel):
    service_name: str
    category: str
    bookings_count: int
    total_revenue: float


class ReportSummary(BaseModel):
    kpis: DashboardKpi
    revenue_trends: List[RevenueTrend]
    appointment_statuses: List[AppointmentStatusCount]
    popular_services: List[ServicePopularity]
