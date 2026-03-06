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