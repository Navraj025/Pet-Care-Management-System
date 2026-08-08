from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.system_setting import SystemSetting
from app.auth.deps import require_roles

router = APIRouter(prefix="/settings", tags=["System Settings"])


@router.get("")
def get_settings(
    db: Session = Depends(get_db)
):
    settings = db.query(SystemSetting).all()
    return {s.key: s.value for s in settings}


@router.put("")
def update_settings(
    data: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"]))
):
    for key, val in data.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            setting.value = str(val)
        else:
            setting = SystemSetting(key=key, value=str(val))
            db.add(setting)
    db.commit()
    return {"message": "Settings updated successfully"}
