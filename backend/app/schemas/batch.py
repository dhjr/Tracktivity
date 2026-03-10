from pydantic import BaseModel

class BatchCreate(BaseModel):
    name: str
<<<<<<< HEAD

=======
    
>>>>>>> 3640089ead5a3bbbb8bb3c6d2566505e19ce88c0
class BatchJoin(BaseModel):
    batch_code: str
  