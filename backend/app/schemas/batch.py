from pydantic import BaseModel

class BatchCreate(BaseModel):
    name: str
    batch_code: str
    created_by: str  # UUID of the faculty member

class BatchJoin(BaseModel):
    batch_code: str
    student_id: str  # UUID of the student joining
