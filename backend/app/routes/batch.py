from fastapi import APIRouter, HTTPException, status, Depends
from schemas.batch import BatchCreate, BatchJoin
from internal.session import get_supabase
from internal.dependencies import get_current_user, require_role
import random
import string

def generate_batch_code():
    chars = string.ascii_uppercase + string.digits
    random_str = ''.join(random.choice(chars) for _ in range(8))
    return f"BATCH-{random_str}"



router = APIRouter(prefix="/batches", tags=["batches"])

@router.post("/create-batch")
async def create_batch(
    batch_data: BatchCreate,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    try:
        batch_code = batch_data.batch_code or generate_batch_code()
        
        # Create the batch
        response = db.table("batches").insert({
            "name": batch_data.name,
            "batch_code": batch_code,
            "created_by": current_user.id
        }).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create batch."
            )

        batch_id = response.data[0]["id"]

        # Add the faculty as admin in batch_faculty
        bf_response = db.table("batch_faculty").insert({
            "batch_id": batch_id,
            "faculty_id": current_user.id,
            "is_admin": True
        }).execute()

        if not bf_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Batch created but failed to assign faculty admin."
            )

        return {
            "message": "Batch created successfully",
            "batch": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
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
async def join_batch(
    join_data: BatchJoin,
    db=Depends(get_supabase),
    current_user=Depends(get_current_user)
):
    # Lookup batch
    batch_res = db.table("batches").select("id, name").eq("batch_code", join_data.batch_code).execute()
    if not batch_res.data:
        raise HTTPException(status_code=404, detail="Invalid batch code.")
    
    batch_id = batch_res.data[0]["id"]
    batch_name = batch_res.data[0]["name"]
    user_role = current_user.user_metadata.get("role")

    if user_role == "student":
        res = db.table("students").update({"batch_id": batch_id}).eq("id", current_user.id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Student record not found.")

    elif user_role == "faculty":
        res = db.table("batch_faculty").insert({
            "batch_id": batch_id,
            "faculty_id": current_user.id,
            "is_admin": False
        }).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to join batch.")

    return {"message": f"Successfully joined batch {batch_name}", "batch": batch_res.data[0]}

@router.delete("/{batch_id}")
async def delete_batch(
    batch_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    try:
        # Verify faculty actually created this batch or has admin rights
        batch = db.table("batches").select("id").eq("id", batch_id).eq("created_by", current_user.id).single().execute()
        if not batch.data:
            raise HTTPException(status_code=404, detail="Batch not found or unauthorized to manage this batch.")
            
        res = db.table("batches").delete().eq("id", batch_id).execute()
        if not hasattr(res, 'data'):
            raise HTTPException(status_code=500, detail="Failed to delete batch.")
            
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{batch_id}/students")
async def get_batch_students(
    batch_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    try:
        batch = db.table("batches").select("id, name, batch_code").eq("id", batch_id).eq("created_by", current_user.id).single().execute()
        if not batch.data:
            raise HTTPException(status_code=404, detail="Batch not found or unauthorized.")
            
        students_res = db.table("students").select("id, full_name, ktuid, department, student_type").eq("batch_id", batch_id).execute()
        
        formatted_students = []
        if students_res.data:
            for student in students_res.data:
                formatted_students.append({
                    "student_id": student.get("id"),
                    "studentName": student.get("full_name") or "Unknown",
                    "studentEmail": "N/A",
                    "ktuId": student.get("ktuid") or "N/A",
                    "department": student.get("department") or "N/A",
                    "studentType": student.get("student_type") or "N/A",
                    "isKtuVerified": False
                })
        return {"batch": batch.data, "students": formatted_students}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))