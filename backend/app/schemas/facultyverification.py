from pydantic import BaseModel
from typing import Optional

class VerifySubmission(BaseModel):
    status: str
    comments: Optional[str] = None
    activity_id: Optional[str] = None
    activity_name: Optional[str] = None
    group_name: Optional[str] = None
    level: Optional[str] = None
    points_awarded: Optional[int] = None
    academic_year: Optional[int] = None
    certificate_date: Optional[str] = None