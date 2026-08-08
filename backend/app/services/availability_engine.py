from datetime import datetime, date, time, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.staff import Staff
from app.models.service import Service
from app.models.appointment import Appointment, AppointmentStatus
from app.models.availability import Availability
from app.schemas.availability import TimeSlot


def calculate_available_slots(
    db: Session,
    staff_id: int,
    service_id: int,
    target_date: date
) -> List[TimeSlot]:
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    service = db.query(Service).filter(Service.id == service_id).first()
    
    if not staff or not service or not staff.is_available:
        return []

    # 1. Check Day of Week (e.g. "Mon,Tue,Wed,Thu,Fri,Sat")
    day_name = target_date.strftime("%a") # e.g., "Mon"
    working_days = [d.strip() for d in staff.working_days.split(",") if d.strip()]
    if day_name not in working_days:
        return []

    # 2. Check Custom Availability / Leaves for specific date
    custom_avail = db.query(Availability).filter(
        Availability.staff_id == staff_id,
        Availability.date == target_date
    ).first()

    if custom_avail and not custom_avail.is_available:
        return [] # Staff is on leave / unavailable on target_date

    # Determine shift hours
    start_str = custom_avail.start_time if (custom_avail and custom_avail.start_time) else staff.start_time
    end_str = custom_avail.end_time if (custom_avail and custom_avail.end_time) else staff.end_time
    
    start_h, start_m = map(int, start_str.split(":"))
    end_h, end_m = map(int, end_str.split(":"))
    
    break_s_h, break_s_m = map(int, staff.break_start.split(":"))
    break_e_h, break_e_m = map(int, staff.break_end.split(":"))

    shift_start = datetime.combine(target_date, time(start_h, start_m))
    shift_end = datetime.combine(target_date, time(end_h, end_m))
    break_start = datetime.combine(target_date, time(break_s_h, break_s_m))
    break_end = datetime.combine(target_date, time(break_e_h, break_e_m))

    # 3. Fetch Existing Booked Appointments (excluding CANCELLED)
    existing_appointments = db.query(Appointment).filter(
        Appointment.staff_id == staff_id,
        Appointment.appointment_date == target_date,
        Appointment.status != AppointmentStatus.CANCELLED
    ).all()

    booked_intervals = []
    for appt in existing_appointments:
        a_sh, a_sm = map(int, appt.start_time.split(":"))
        a_eh, a_em = map(int, appt.end_time.split(":"))
        booked_start = datetime.combine(target_date, time(a_sh, a_sm))
        booked_end = datetime.combine(target_date, time(a_eh, a_em))
        booked_intervals.append((booked_start, booked_end))

    # 4. Generate Slots based on Service Duration (e.g. 30 min, 45 min, 60 min)
    duration = timedelta(minutes=service.duration_minutes)
    step = timedelta(minutes=30) # 30 min slot interval grid

    slots: List[TimeSlot] = []
    current = shift_start

    while current + duration <= shift_end:
        slot_start = current
        slot_end = current + duration
        slot_time_str = slot_start.strftime("%H:%M")

        is_available = True
        reason = None

        # Check break overlap
        if not (slot_end <= break_start or slot_start >= break_end):
            is_available = False
            reason = "Staff Break Hour"

        # Check existing appointment overlap
        if is_available:
            for b_start, b_end in booked_intervals:
                if not (slot_end <= b_start or slot_start >= b_end):
                    is_available = False
                    reason = "Already Booked"
                    break

        slots.append(TimeSlot(
            time=slot_time_str,
            available=is_available,
            reason=reason
        ))

        current += step

    return slots
