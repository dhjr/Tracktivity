import random
import string
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from schemas.batch import BatchCreate, BatchJoin
from internal.session import get_supabase
from internal.dependencies import get_current_user, require_role

router = APIRouter(prefix="/batches", tags=["batches"])

def generate_batch_code() -> str:
    characters = string.ascii_uppercase + string.digits
    return "".join(random.choices(characters, k=7))

# create a new batch
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




@router.delete("/leave")
async def leave_batch(
    batch_id: Optional[str] = None,
    db=Depends(get_supabase),
    current_user=Depends(get_current_user)
):
    user_role = current_user.user_metadata.get("role")

    if user_role == "student":
        try:
            student_res = db.table("students") \
                .select("id, batch_id") \
                .eq("id", current_user.id) \
                .single() \
                .execute()
        except Exception:
            raise HTTPException(status_code=404, detail="Student record not found.")

        resolved_batch_id = student_res.data.get("batch_id")
        if not resolved_batch_id:
            raise HTTPException(status_code=400, detail="You are not enrolled in any batch.")

        db.table("submissions") \
            .delete() \
            .eq("student_id", current_user.id) \
            .eq("batch_id", resolved_batch_id) \
            .execute()

        db.table("students") \
            .update({
                "batch_id": None,
                "grp1_points": 0,
                "grp2_points": 0,
                "grp3_points": 0
            }) \
            .eq("id", current_user.id) \
            .execute()

        return {"message": "Successfully left the batch. All submissions have been deleted."}

    elif user_role == "faculty":
        if not batch_id:
            raise HTTPException(
                status_code=400,
                detail="Faculty must provide batch_id as a query parameter. e.g. /batches/leave?batch_id=..."
            )

        try:
            member_res = db.table("batch_faculty") \
                .select("faculty_id, is_admin") \
                .eq("batch_id", batch_id) \
                .eq("faculty_id", current_user.id) \
                .single() \
                .execute()
        except Exception:
            raise HTTPException(status_code=404, detail="You are not a member of this batch.")

        if member_res.data["is_admin"]:
            admin_count_res = db.table("batch_faculty") \
                .select("faculty_id") \
                .eq("batch_id", batch_id) \
                .eq("is_admin", True) \
                .execute()

            if len(admin_count_res.data) <= 1:
                raise HTTPException(
                    status_code=400,
                    detail="You are the only admin of this batch. Promote another faculty to admin before leaving."
                )

        db.table("batch_faculty") \
            .delete() \
            .eq("batch_id", batch_id) \
            .eq("faculty_id", current_user.id) \
            .execute()

        return {"message": "Successfully left the batch."}

    else:
        raise HTTPException(status_code=403, detail="Unknown role.")

# get basic details of a single batch by ID (accessible to authenticated members)
@router.get("/{batch_id}")
async def get_batch_by_id(
    batch_id: str,
    db=Depends(get_supabase),
    current_user=Depends(get_current_user),
):
    batch_res = (
        db.table("batches")
        .select("id, name, batch_code, created_at, created_by")
        .eq("id", batch_id)
        .single()
        .execute()
    )
    if not batch_res.data:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch_res.data

# can be only done by a faculty
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


# get the list of all members within a batch
# can be used by both faculty and students
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


