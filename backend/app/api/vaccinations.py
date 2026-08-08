from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.pet import Pet
from app.models.vaccination import Vaccination, VaccinationStatus
from app.schemas.vaccination import VaccinationOut, VaccinationCreate, VaccinationUpdate
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/vaccinations", tags=["Vaccinations"])


@router.get("", response_model=List[VaccinationOut])
def list_vaccinations(
    pet_id: Optional[int] = None,
    status: Optional[VaccinationStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Vaccination)

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            return []
        query = query.join(Pet).filter(Pet.customer_id == current_user.customer_profile.id)

    if pet_id:
        query = query.filter(Vaccination.pet_id == pet_id)
    if status:
        query = query.filter(Vaccination.status == status)

    vaccinations = query.order_by(Vaccination.date_administered.desc()).all()

    # Dynamically update overdue status if next_due_date < today
    today = date.today()
    for v in vaccinations:
        if v.next_due_date and v.next_due_date < today and v.status != VaccinationStatus.OVERDUE:
            v.status = VaccinationStatus.OVERDUE
            db.commit()

    return vaccinations


@router.post("", response_model=VaccinationOut)
def create_vaccination_record(
    data: VaccinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"]))
):
    pet = db.query(Pet).filter(Pet.id == data.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    staff_id = data.staff_id
    if not staff_id and current_user.staff_profile:
        staff_id = current_user.staff_profile.id

    vac = Vaccination(
        pet_id=data.pet_id,
        staff_id=staff_id,
        vaccine_name=data.vaccine_name,
        date_administered=data.date_administered,
        next_due_date=data.next_due_date,
        batch_number=data.batch_number,
        status=data.status,
        notes=data.notes
    )
    db.add(vac)
    db.commit()
    db.refresh(vac)

    log_audit_action(db, current_user.id, "CREATE_VACCINATION", "VACCINATION", vac.id, f"Administered {vac.vaccine_name} to {pet.name}")
    return vac


@router.put("/{vaccination_id}", response_model=VaccinationOut)
def update_vaccination_record(
    vaccination_id: int,
    data: VaccinationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"]))
):
    vac = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vac:
        raise HTTPException(status_code=404, detail="Vaccination record not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(vac, field, val)

    db.commit()
    db.refresh(vac)
    return vac
