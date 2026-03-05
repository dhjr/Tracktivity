from pydantic import BaseModel

class BatchCreate(BaseModel):
    name: str
    batch_code: str
    created_by: str  # UUID of the faculty member
