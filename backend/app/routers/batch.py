from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.batch import BatchCreate
from app.internal.session import get_supabase

router = APIRouter(prefix="/batches", tags=["batches"])

@router.post("/")
async def create_batch(batch_data: BatchCreate, db=Depends(get_supabase)):
    try:
        response = db.table("batches").insert({
            "name": batch_data.name,
            "batch_code": batch_data.batch_code,
            "created_by": batch_data.created_by
        }).execute()

        # The response could be empty if no data is returned, we check data
        if not response.data:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create batch."
            )

        return {"message": "Batch created successfully", "batch": response.data[0]}

    except Exception as e:
        error_msg = str(e)
        # Check if it is a unique constraint violation for batch_code
        if "duplicate key value violates unique constraint" in error_msg or "batches_batch_code_key" in error_msg:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch code already exists."
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
