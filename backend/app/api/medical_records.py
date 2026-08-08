from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.pet import Pet
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import MedicalRecordOut, MedicalRecordCreate, MedicalRecordUpdate
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


@router.get("", response_model=List[MedicalRecordOut])
def list_medical_records(
    pet_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MedicalRecord)

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            return []
        query = query.join(Pet).filter(Pet.customer_id == current_user.customer_profile.id)
    
    if pet_id:
        query = query.filter(MedicalRecord.pet_id == pet_id)

    return query.order_by(MedicalRecord.date.desc()).all()


@router.post("", response_model=MedicalRecordOut)
def create_medical_record(
    data: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"]))
):
    pet = db.query(Pet).filter(Pet.id == data.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    staff_id = data.staff_id
    if not staff_id and current_user.staff_profile:
        staff_id = current_user.staff_profile.id

    rec = MedicalRecord(
        pet_id=data.pet_id,
        staff_id=staff_id,
        appointment_id=data.appointment_id,
        date=data.date,
        symptoms=data.symptoms,
        diagnosis=data.diagnosis,
        treatment=data.treatment,
        prescription=data.prescription,
        weight=data.weight,
        temperature=data.temperature,
        follow_up_date=data.follow_up_date,
        notes=data.notes
    )
    
    # Optionally update pet's current recorded weight
    if data.weight:
        pet.weight = data.weight

    db.add(rec)
    db.commit()
    db.refresh(rec)

    log_audit_action(db, current_user.id, "CREATE_MEDICAL_RECORD", "MEDICAL_RECORD", rec.id, f"Added consultation record for pet '{pet.name}'")
    return rec


@router.get("/{record_id}", response_model=MedicalRecordOut)
def get_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Medical record not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or rec.pet.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    return rec


@router.put("/{record_id}", response_model=MedicalRecordOut)
def update_medical_record(
    record_id: int,
    data: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "STAFF"]))
):
    rec = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Medical record not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(rec, field, val)

    db.commit()
    db.refresh(rec)
    return rec
