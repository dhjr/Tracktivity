from pydantic import BaseModel

class BatchCreate(BaseModel):
    name: str
     

class BatchJoin(BaseModel):
    batch_code: str
  