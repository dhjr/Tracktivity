from fastapi import APIRouter, HTTPException, status, Depends
from internal.session import get_supabase
from internal.dependencies import require_role
from schemas.facultyverification import VerifySubmission
from datetime import datetime, timezone

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
        batch["is_admin"] = row["is_admin"]
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
        student_id,
        activity_id,
        activity_name,
        group_name,
        level,
        points_awarded,
        academic_year,
        certificate_date,
        created_at
    """) \
    .eq("batch_id", batch_id) \
    .eq("status", "pending") \
    .order("created_at", desc=False) \
    .execute()

    submissions = res.data
    for sub in submissions:
       student_res = db.table("students") \
           .select("id, full_name, ktuid, department") \
           .eq("id", sub["student_id"]) \
           .single() \
           .execute()
       sub["student"] = student_res.data

    return {"pending_submissions": submissions}



@router.get("/submissions/{submission_id}")
async def get_submission_detail(
    submission_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):

    res = db.table("submissions") \
        .select("""
            id,
            batch_id,
            student_id,
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
            created_at
        """) \
        .eq("id", submission_id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Submission not found.")

    submission = res.data

    await verify_admin_access(submission["batch_id"], current_user.id, db)

    student_res = db.table("students") \
        .select("id, full_name, ktuid, department") \
        .eq("id", submission["student_id"]) \
        .single() \
        .execute()
    submission["student"] = student_res.data

    try:
        file_path = submission["certificate_url"].split("/object/public/activity-certificates/")[-1]
        signed = db.storage.from_("activity-certificates").create_signed_url(
            path=file_path,
            expires_in=300
        )
        print("Signed URL response:", signed)  

        submission["certificate_url"] = signed["signedURL"]
    except Exception as e:
        print(f"Failed to generate signed URL: {e}")

    # 5. Fetch matching rule from rulebook
    rulebook_res = db.table("activity_rulebook") \
        .select("data") \
        .eq("id", 1) \
        .single() \
        .execute()

    rule = None
    if rulebook_res.data:
        data = rulebook_res.data["data"]
        activity_id = submission["activity_id"]
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


@router.patch("/submissions/{submission_id}/verify")
async def verify_submission(
    submission_id: str,
    data: VerifySubmission,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    
    if data.status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be 'approved' or 'rejected'."
        )

    # Fetch the submission
    res = db.table("submissions") \
        .select("id, batch_id, student_id, group_name, points_awarded, status") \
        .eq("id", submission_id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Submission not found.")

    submission = res.data

    #  Check it's still pending
    if submission["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Submission is already {submission['status']}."
        )

    # 4. Verify faculty has admin access to this batch
    await verify_admin_access(submission["batch_id"], current_user.id, db)

    # 5. Update the submission
    update_payload = {
        "status": data.status,
        "verified_by": current_user.id,
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "comments": data.comments,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    db.table("submissions") \
        .update(update_payload) \
        .eq("id", submission_id) \
        .execute()

    # 6. If approved — update student group points
    if data.status == "approved":
        group_name = submission["group_name"]
        points = submission["points_awarded"]
        student_id = submission["student_id"]

        # Map group_name to column
        group_column_map = {
            "GROUP_I": "grp1_points",
            "GROUP_II": "grp2_points",
            "GROUP_III": "grp3_points"
        }

        column = group_column_map.get(group_name)
        if not column:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown group name: {group_name}"
            )

        # Fetch current points
        student_res = db.table("students") \
            .select(column) \
            .eq("id", student_id) \
            .single() \
            .execute()

        if not student_res.data:
            raise HTTPException(status_code=404, detail="Student not found.")

        current_points = student_res.data[column]

        # Increment points
        db.table("students") \
            .update({column: current_points + points}) \
            .eq("id", student_id) \
            .execute()

    return {
        "message": f"Submission {data.status} successfully.",
        "submission_id": submission_id,
        "status": data.status
    }