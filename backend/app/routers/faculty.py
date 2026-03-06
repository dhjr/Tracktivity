from fastapi import APIRouter, HTTPException, status, Depends
from app.internal.session import get_supabase
from app.internal.dependencies import require_role

router = APIRouter(prefix="/faculty", tags=["faculty"])


async def verify_admin_access(batch_id: str, faculty_id: str, db):
    access = db.table("batch_faculty") \
        .select("faculty_id") \
        .eq("batch_id", batch_id) \
        .eq("faculty_id", faculty_id) \
        .eq("is_admin", True) \
        .execute()

    if not access.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have admin access to this batch."
        )

# obtain list of batches created by a faculty
@router.get("/my-batches")
async def get_my_batches(
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    res = db.table("batch_faculty") \
        .select("is_admin, batch:batches(id, name, batch_code, created_at)") \
        .eq("faculty_id", current_user.id) \
        .execute()

    if not res.data:
        return {"batches": []}

    batches = []
    for row in res.data:
        batch = row["batch"]
        # batch["is_admin"] = row["is_admin"]
        batches.append(batch)

    return {"batches": batches}

# 
@router.get("/batches/{batch_id}/stats")
async def get_batch_stats(
    batch_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
   

    await verify_admin_access(batch_id, current_user.id, db)


    res = db.table("students") \
        .select("grp1_points, grp2_points, grp3_points") \
        .eq("batch_id", batch_id) \
        .execute()

    if not res.data:
        return {
            "student_count": 0,
            "averages": {"grp1": 0, "grp2": 0, "grp3": 0}
        }

    count = len(res.data)
    averages = {
        "grp1": round(sum(s["grp1_points"] for s in res.data) / count, 2),
        "grp2": round(sum(s["grp2_points"] for s in res.data) / count, 2),
        "grp3": round(sum(s["grp3_points"] for s in res.data) / count, 2),
    }

    return {"student_count": count, "averages": averages}



# not tested yet
@router.get("/batches/{batch_id}/submissions/pending")
async def get_pending_submissions(
    batch_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)


   
    res = db.table("submissions") \
        .select("""
            id,
            activity_id,
            activity_name,
            group_name,
            level,
            points_awarded,
            academic_year,
            certificate_date,
            created_at,
            student:students(id, full_name, ktuid, department)
        """) \
        .eq("batch_id", batch_id) \
        .eq("status", "pending") \
        .order("created_at", desc=False) \
        .execute()

    return {"pending_submissions": res.data}