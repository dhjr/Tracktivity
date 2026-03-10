from pydantic import BaseModel
from typing import Optional

class VerifySubmission(BaseModel):
    status: str  
    comments: Optional[str] = None