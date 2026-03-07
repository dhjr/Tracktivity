from pydantic import BaseModel

class BatchCreate(BaseModel):
    name: str
    batch_code: str | None = None
    

class BatchJoin(BaseModel):
    batch_code: str
  