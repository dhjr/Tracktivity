from pydantic import BaseModel

class BatchCreate(BaseModel):
    name: str
<<<<<<< HEAD
    batch_code: str | None = None
    
=======
     
>>>>>>> a004f25eca7d244b513149eb6ea98937922fd5be

class BatchJoin(BaseModel):
    batch_code: str
  