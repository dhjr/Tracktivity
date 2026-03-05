from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.batch import BatchCreate, BatchJoin
from app.internal.session import get_supabase
from app.internal.dependencies import get_current_user, require_role


router = APIRouter(prefix="/batches", tags=["batches"])

@router.post("/")
async def create_batch(batch_data: BatchCreate, db=Depends(get_supabase), current_user=Depends(require_role("faculty")) ):
    try:
        response = db.table("batches").insert({
            "name": batch_data.name,
            "batch_code": batch_data.batch_code,
            "created_by": current_user.id
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

@router.post("/join")
async def join_batch(join_data: BatchJoin, db=Depends(get_supabase), current_user=Depends(get_current_user)):
    try:
        # 1. Lookup the batch by batch_code
        batch_res = db.table("batches").select("id, name").eq("batch_code", join_data.batch_code).execute()
        
        if not batch_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid batch code. Batch not found."
            )
            
        batch_id = batch_res.data[0]["id"]
        batch_name = batch_res.data[0]["name"]
        
        # 2. Update the student's batch_id in the students table
        update_res = db.table("students").update({"batch_id": batch_id}).eq("id", join_data.student_id).execute()
        
        if not update_res.data:
            raise HTTPException(
                 status_code=status.HTTP_404_NOT_FOUND,
                 detail="Student record not found."
            )
            
        return {"message": f"Successfully joined batch {batch_name}", "batch": batch_res.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
