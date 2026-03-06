from fastapi import APIRouter, HTTPException, status, Depends
from app.internal.session import get_supabase
from app.internal.dependencies import require_role

router = APIRouter(prefix="/faculty", tags=["faculty"])


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

    # Flatten the response
    batches = []
    for row in res.data:
        batch = row["batch"]
        # batch["is_admin"] = row["is_admin"]
        batches.append(batch)

    return {"batches": batches}


@router.get("/batches/{batch_id}/stats")
async def get_batch_stats(
    batch_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    # Check faculty belongs to this batch
    access = db.table("batch_faculty") \
        .select("faculty_id") \
        .eq("batch_id", batch_id) \
        .eq("faculty_id", current_user.id) \
        .execute()

    if not access.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this batch."
        )

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