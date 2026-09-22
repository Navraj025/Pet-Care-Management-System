from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer, cast

from app.database import get_db
from app.models.user import User, UserRole
from app.models.business import Business, BusinessStatus
from app.models.service import Service
from app.schemas.service import ServiceOut, ServiceCreate, ServiceUpdate, UniqueServiceOut
from app.auth.deps import get_current_user, require_roles
from app.services.audit_service import log_audit_action

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("/unique", response_model=List[UniqueServiceOut])
def list_unique_services(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get aggregated unique service types across active approved businesses.
    Eliminates duplicates across multiple clinics and returns price ranges and duration.
    """
    query = (
        db.query(
            Service.name,
            Service.category,
            func.min(Service.description).label("description"),
            func.min(Service.price).label("min_price"),
            func.max(Service.price).label("max_price"),
            cast(func.round(func.avg(Service.duration_minutes)), Integer).label("default_duration"),
            func.count(func.distinct(Service.business_id)).label("business_count")
        )
        .join(Business, Service.business_id == Business.id)
        .filter(Service.is_active == True, Business.status == BusinessStatus.APPROVED)
    )

    if category and category.lower() != "all":
        query = query.filter(Service.category.ilike(f"%{category.strip()}%"))
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Service.name.ilike(search_term)) |
            (Service.description.ilike(search_term)) |
            (Service.category.ilike(search_term))
        )

    rows = (
        query.group_by(Service.name, Service.category)
        .order_by(Service.category.asc(), Service.name.asc())
        .all()
    )

    results = []
    for r in rows:
        results.append(
            UniqueServiceOut(
                name=r.name,
                category=r.category,
                description=r.description or f"Professional {r.name} offered across certified clinics.",
                min_price=float(r.min_price or 0.0),
                max_price=float(r.max_price or 0.0),
                default_duration=int(r.default_duration or 30),
                business_count=int(r.business_count or 0)
            )
        )
    return results



@router.get("", response_model=List[ServiceOut])
def list_services(
    category: Optional[str] = None,
    business_id: Optional[int] = None,
    active_only: bool = True,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Service)
    if active_only:
        query = query.filter(Service.is_active == True)
    if business_id:
        query = query.filter(Service.business_id == business_id)
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
    current_user: User = Depends(require_roles(["ADMIN", "BUSINESS_OWNER"]))
):
    target_business_id = data.business_id
    if current_user.role == UserRole.BUSINESS_OWNER:
        from app.models.business import Business
        biz = db.query(Business).filter(Business.owner_id == current_user.id).first()
        if not biz:
            raise HTTPException(status_code=400, detail="No registered business profile found")
        target_business_id = biz.id

    srv = Service(
        business_id=target_business_id,
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
    current_user: User = Depends(require_roles(["ADMIN", "BUSINESS_OWNER"]))
):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")

    if current_user.role == UserRole.BUSINESS_OWNER:
        from app.models.business import Business
        biz = db.query(Business).filter(Business.owner_id == current_user.id).first()
        if not biz or srv.business_id != biz.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this service")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(srv, field, val)

    db.commit()
    db.refresh(srv)
    return srv


@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "BUSINESS_OWNER"]))
):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if current_user.role == UserRole.BUSINESS_OWNER:
        from app.models.business import Business
        biz = db.query(Business).filter(Business.owner_id == current_user.id).first()
        if not biz or srv.business_id != biz.id:
            raise HTTPException(status_code=403, detail="Not authorized to deactivate this service")

    srv.is_active = False
    db.commit()
    return {"message": "Service deactivated successfully"}
