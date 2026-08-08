from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AiQueryRequest(BaseModel):
    prompt: str
    pet_id: Optional[int] = None


class AiQueryResponse(BaseModel):
    response: str
    suggested_actions: Optional[List[str]] = None
