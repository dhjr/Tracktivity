from fastapi import APIRouter, HTTPException, status, Depends
from internal.session import get_supabase
from internal.dependencies import require_role

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



@router.get("/submissions/{submission_id}")
async def get_submission_detail(
    submission_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    # 1. Fetch the submission
    res = db.table("submissions") \
        .select("""
            id,
            batch_id,
            activity_id,
            activity_name,
            group_name,
            level,
            points_awarded,
            academic_year,
            certificate_date,
            certificate_url,
            status,
            comments,
            created_at,
            student:students(id, full_name, ktuid, department)
        """) \
        .eq("id", submission_id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Submission not found.")

    submission = res.data

    # 2. Verify faculty has admin access to this submission's batch
    await verify_admin_access(submission["batch_id"], current_user.id, db)

    # 3. Fetch matching rule from rulebook
    rulebook_res = db.table("activity_rulebook") \
        .select("data") \
        .eq("id", 1) \
        .single() \
        .execute()

    rule = None
    if rulebook_res.data:
       data = rulebook_res.data["data"]
       activity_id = submission["activity_id"]  # e.g. "1.1"
       for category in data.get("categories", []):
          for activity in category.get("activities", []):
              if activity.get("code") == activity_id:
                 rule = activity
                 break
          if rule:
            break

    return {
        "submission": submission,
        "rule": rule
    }

@router.get("/students")
async def get_students(
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    try:
        response = db.auth.admin.list_users()
        users = response.users if hasattr(response, "users") else (response if isinstance(response, list) else [])
        
        students = []
        for user in users:
            meta = user.user_metadata or {}
            if meta.get("role") == "student":
                students.append({
                    "id": user.id,
                    "name": meta.get("name", "Unknown"),
                    "email": user.email,
                    "ktuId": meta.get("ktuId", "N/A"),
                    "isKtuVerified": meta.get("isKtuVerified") == True
                })
        return {"students": students}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-student")
async def verify_student(req: dict, db=Depends(get_supabase), current_user=Depends(require_role("faculty"))):
    try:
        student_id = req.get("studentId")
        if not student_id:
            raise HTTPException(status_code=400, detail="Student ID is required")
            
        student_req = db.auth.admin.get_user_by_id(student_id)
        if not student_req or not hasattr(student_req, "user"):
            raise HTTPException(status_code=404, detail="Student not found.")
            
        current_metadata = student_req.user.user_metadata or {}
        current_metadata["isKtuVerified"] = True
        
        update_data = db.auth.admin.update_user_by_id(student_id, {"user_metadata": current_metadata})
        user_dump = update_data.user.model_dump() if hasattr(update_data.user, "model_dump") else (update_data.user.__dict__ if hasattr(update_data.user, "__dict__") else update_data.user)

        return {"success": True, "user": user_dump}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))