import random
import string

from fastapi import APIRouter, HTTPException, status, Depends
from schemas.batch import BatchCreate, BatchJoin
from internal.session import get_supabase
from internal.dependencies import get_current_user, require_role

router = APIRouter(prefix="/batches", tags=["batches"])

def generate_batch_code() -> str:
    characters = string.ascii_uppercase + string.digits
    return "".join(random.choices(characters, k=7))


@router.post("/")
async def create_batch(
    batch_data: BatchCreate,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    try:
        max_attempts = 5
        batch_code = None
        for _ in range(max_attempts):
            candidate = generate_batch_code()
            existing = (
                db.table("batches")
                .select("id")
                .eq("batch_code", candidate)
                .execute()
            )
            if not existing.data:
                batch_code = candidate
                break

        if not batch_code:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate unique batch code. Please try again.",
            )

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/join")
async def join_batch(
    join_data: BatchJoin,
    db=Depends(get_supabase),
    current_user=Depends(get_current_user)
):
    # Lookup batch (standardize input to uppercase)
    code = join_data.batch_code.upper()
    batch_res = (
        db.table("batches").select("id, name").eq("batch_code", code).execute()
    )
    if not batch_res.data:
        raise HTTPException(status_code=404, detail=f"Invalid batch code: {code}")
    
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
    current_user=Depends(require_role("faculty")),
):
    try:
        # Check if user is admin of this batch
        admin_check = (
            db.table("batch_faculty")
            .select("is_admin")
            .eq("batch_id", batch_id)
            .eq("faculty_id", current_user.id)
            .eq("is_admin", True)
            .execute()
        )

        if not admin_check.data:
            raise HTTPException(
                status_code=403, detail="Unauthorized to delete this batch."
            )

        # 1. Delete all submissions associated with this batch
        db.table("submissions").delete().eq("batch_id", batch_id).execute()

        # 2. Un-enroll students from this batch (set batch_id to null)
        db.table("students").update({"batch_id": None}).eq("batch_id", batch_id).execute()

        # 3. Delete all faculty associations for this batch
        db.table("batch_faculty").delete().eq("batch_id", batch_id).execute()

        # 4. Finally delete the batch
        db.table("batches").delete().eq("id", batch_id).execute()
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{batch_id}/students")
@router.get("/{batch_id}/members")
async def get_batch_members(
    batch_id: str, db=Depends(get_supabase), current_user=Depends(get_current_user)
):
    # Fetch batch details first
    batch_res = (
        db.table("batches")
        .select("id, name, batch_code")
        .eq("id", batch_id)
        .single()
        .execute()
    )
    if not batch_res.data:
        raise HTTPException(status_code=404, detail="Batch not found")

    user_role = current_user.user_metadata.get("role")

    if user_role == "student":
        member_check = (
            db.table("students")
            .select("id")
            .eq("id", current_user.id)
            .eq("batch_id", batch_id)
            .execute()
        )
        if not member_check.data:
            raise HTTPException(
                status_code=403, detail="You are not a member of this batch."
            )

    elif user_role == "faculty":
        member_check = (
            db.table("batch_faculty")
            .select("faculty_id")
            .eq("faculty_id", current_user.id)
            .eq("batch_id", batch_id)
            .execute()
        )
        if not member_check.data:
            raise HTTPException(
                status_code=403, detail="You are not a member of this batch."
            )

    students_res = (
        db.table("students")
        .select("id, full_name, ktuid, department, student_type")
        .eq("batch_id", batch_id)
        .execute()
    )

    faculty_res = (
        db.table("batch_faculty")
        .select("is_admin, faculty:faculty(id, full_name, department)")
        .eq("batch_id", batch_id)
        .execute()
    )

    faculty_list = []
    for row in faculty_res.data or []:
        member = row["faculty"]
        member["is_admin"] = row["is_admin"]
        faculty_list.append(member)

    # Format students to match frontend expectations
    formatted_students = []
    for s in students_res.data or []:
        formatted_students.append(
            {
                "student_id": s["id"],
                "studentName": s["full_name"] or "Unknown",
                "studentEmail": "N/A",  # Email might need auth admin call if needed, but keeping N/A for now
                "ktuId": s["ktuid"] or "N/A",
                "department": s["department"] or "N/A",
                "studentType": s["student_type"] or "N/A",
                "isKtuVerified": False,  # Should ideally be fetched if available in DB
            }
        )

    return {
        "students": formatted_students,
        "faculty": faculty_list
    }
