from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.ai import AiQueryRequest, AiQueryResponse
from app.services.ai_service import generate_pet_ai_response
from app.auth.deps import get_current_user

router = APIRouter(prefix="/ai-assistant", tags=["AI Pet Care Assistant"])


@router.post("/query", response_model=AiQueryResponse)
def query_pet_assistant(
    data: AiQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return generate_pet_ai_response(
        db=db,
        user=current_user,
        prompt=data.prompt,
        pet_id=data.pet_id
    )
