from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.pet import Pet
from app.schemas.pet import PetOut, PetCreate, PetUpdate
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/pets", tags=["Pets"])


@router.get("", response_model=List[PetOut])
def list_pets(
    customer_id: Optional[int] = None,
    species: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Pet)
    
    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            return []
        query = query.filter(Pet.customer_id == current_user.customer_profile.id)
    elif customer_id:
        query = query.filter(Pet.customer_id == customer_id)

    if species:
        query = query.filter(Pet.species.ilike(f"%{species}%"))
    if search:
        query = query.filter(
            (Pet.name.ilike(f"%{search}%")) |
            (Pet.breed.ilike(f"%{search}%")) |
            (Pet.microchip_id.ilike(f"%{search}%"))
        )
    return query.order_by(Pet.id.desc()).all()


@router.post("", response_model=PetOut)
def create_pet(
    data: PetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile:
            raise HTTPException(status_code=400, detail="Customer profile missing")
        target_customer_id = current_user.customer_profile.id
    else:
        if not data.customer_id:
            raise HTTPException(status_code=400, detail="customer_id is required for admin/staff")
        target_customer_id = data.customer_id

    pet = Pet(
        customer_id=target_customer_id,
        name=data.name,
        species=data.species,
        breed=data.breed,
        gender=data.gender,
        date_of_birth=data.date_of_birth,
        weight=data.weight,
        color=data.color,
        microchip_id=data.microchip_id,
        allergies=data.allergies,
        existing_conditions=data.existing_conditions,
        emergency_notes=data.emergency_notes,
        avatar_url=data.avatar_url
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    
    log_audit_action(db, current_user.id, "CREATE_PET", "PET", pet.id, f"Registered pet '{pet.name}'")
    return pet


@router.get("/{pet_id}", response_model=PetOut)
def get_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or pet.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this pet")
    return pet


@router.put("/{pet_id}", response_model=PetOut)
def update_pet(
    pet_id: int,
    data: PetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or pet.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this pet")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(pet, field, val)

    db.commit()
    db.refresh(pet)
    return pet


@router.delete("/{pet_id}")
def delete_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_profile or pet.customer_id != current_user.customer_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this pet")

    db.delete(pet)
    db.commit()
    return {"message": "Pet deleted successfully"}
