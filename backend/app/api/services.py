from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.service import Service
from app.schemas.service import ServiceOut, ServiceCreate, ServiceUpdate
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=List[ServiceOut])
def list_services(
    category: Optional[str] = None,
    active_only: bool = True,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Service)
    if active_only:
        query = query.filter(Service.is_active == True)
    if category:
        query = query.filter(Service.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(
            (Service.name.ilike(f"%{search}%")) |
            (Service.description.ilike(f"%{search}%"))
        )
    return query.order_by(Service.category.asc(), Service.name.asc()).all()


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    return srv


@router.post("", response_model=ServiceOut)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    srv = Service(
        name=data.name,
        category=data.category,
        description=data.description,
        duration_minutes=data.duration_minutes,
        price=data.price,
        is_active=data.is_active
    )
    db.add(srv)
    db.commit()
    db.refresh(srv)
    
    log_audit_action(db, current_user.id, "CREATE_SERVICE", "SERVICE", srv.id, f"Created service '{srv.name}'")
    return srv


@router.put("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(srv, field, val)

    db.commit()
    db.refresh(srv)
    return srv


@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    
    srv.is_active = False
    db.commit()
    return {"message": "Service deactivated successfully"}
