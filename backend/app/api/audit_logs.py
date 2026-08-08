from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.auth.deps import require_roles

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_name": log.user.full_name if log.user else "System",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "timestamp": log.timestamp
        }
        for log in logs
    ]
