from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Form, File, UploadFile
from internal.session import get_supabase
from internal.dependencies import require_role
from schemas.facultyverification import VerifySubmission
from datetime import datetime, timezone
from util.helper import fetchRuleBook, validateActivity, maxCheck_meritLevelValidation, highLevel_winOverride, cluster_cap,group_cap_check

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



@router.patch("/batches/{batch_id}/admins/{faculty_id}")
async def promote_to_admin(
    batch_id: str,
    faculty_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)

    try:
        member_res = db.table("batch_faculty") \
            .select("faculty_id, is_admin") \
            .eq("batch_id", batch_id) \
            .eq("faculty_id", faculty_id) \
            .single() \
            .execute()
    except Exception:
        raise HTTPException(
            status_code=404,
            detail="Faculty is not a member of this batch."
        )

    if member_res.data["is_admin"]:
        raise HTTPException(
            status_code=400,
            detail="Faculty is already an admin of this batch."
        )

    db.table("batch_faculty") \
        .update({"is_admin": True}) \
        .eq("batch_id", batch_id) \
        .eq("faculty_id", faculty_id) \
        .execute()

    return {
        "message": "Faculty promoted to admin successfully.",
        "batch_id": batch_id,
        "faculty_id": faculty_id
    }



# obtain the stats of a batch: total number of students, average points per group
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
@router.get("/batches/{batch_id}/submissions")
async def get_batch_submissions(
    batch_id: str,
    academic_year: Optional[int] = None,
    status: Optional[str] = None,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)
    
    query = db.table("submissions") \
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
            status,
            created_at
        """) \
        .eq("batch_id", batch_id)

    if status:
        query = query.eq("status", status)
    if academic_year:
        query = query.eq("academic_year", academic_year)    
        
    res = query.order("academic_year").order("created_at", desc=True).execute()

    submissions = res.data
    for sub in submissions:
        student_res = db.table("students") \
            .select("id, full_name, ktuid, department") \
            .eq("id", sub["student_id"]) \
            .single() \
            .execute()
        sub["student"] = student_res.data

    return {"submissions": submissions}



@router.get("/batches/{batch_id}/students/{student_id}")
async def get_student_metadata(
    batch_id: str,
    student_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)
    
    res = db.table("students") \
        .select("id, full_name, ktuid, department, grp1_points, grp2_points, grp3_points") \
        .eq("id", student_id) \
        .single() \
        .execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Student not found.")
        
    return {"student": res.data}

@router.get("/batches/{batch_id}/students/{student_id}/submissions")
async def get_student_submissions(
    batch_id: str,
    student_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)
    
    res = db.table("submissions") \
        .select("*") \
        .eq("batch_id", batch_id) \
        .eq("student_id", student_id) \
        .order("created_at", desc=True) \
        .execute()
        
    return {"submissions": res.data}



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

    # 1. Fetch the submission
    try:
        res = db.table("submissions") \
            .select("id, batch_id, student_id, group_name, points_awarded, status, activity_id, level") \
            .eq("id", submission_id) \
            .single() \
            .execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Submission not found.")

    submission = res.data
    previous_status = submission["status"]

    await verify_admin_access(submission["batch_id"], current_user.id, db)

    # 2. Resolve effective values
    effective_activity_id = data.activity_id or submission["activity_id"]
    effective_group_name  = data.group_name  or submission["group_name"]
    effective_points      = data.points_awarded if data.points_awarded is not None else submission["points_awarded"]
    effective_level       = data.level if data.level is not None else submission["level"]

    activity_changed = data.activity_id is not None and data.activity_id != submission["activity_id"]
    points_changed   = data.points_awarded is not None and data.points_awarded != submission["points_awarded"]

    # 3. Base payload
    update_payload = {
        "status":         data.status,
        "verified_by":    current_user.id,
        "verified_at":    datetime.now(timezone.utc).isoformat(),
        "updated_at":     datetime.now(timezone.utc).isoformat(),
        "comments":       data.comments,
        "group_name":     effective_group_name,
        "points_awarded": effective_points,
        "activity_id":    effective_activity_id,
        "level":          effective_level,
    }

    # Optional fields
    for field in ("academic_year", "certificate_date"):
        val = getattr(data, field)
        if val is not None:
            update_payload[field] = val

    # 4. Validate only when activity or points are being changed
    if activity_changed or points_changed:
        rulebook = fetchRuleBook(db=db)
        effective_activity = validateActivity(rulebook, effective_activity_id)

        maxCheck_meritLevelValidation(
            points_awarded=effective_points,
            target_activity=effective_activity,
            level_key=effective_level
        )


        highLevel_winOverride(
            target_activity=effective_activity,
            student_id=submission["student_id"],
            activity_code=effective_activity_id,
            points_awarded=effective_points,
            db=db,
            exclude_submission_id=submission_id
        )

        cluster_cap(
            activity_code=effective_activity_id,
            db=db,
            student_id=submission["student_id"],
            rulebook=rulebook,
            points_awarded=effective_points,
            exclude_submission_id=submission_id
        )

        if activity_changed:
            update_payload["activity_name"] = effective_activity["title"]
    
    if data.status == "approved":
        group_cap_check(
            student_id=submission["student_id"],
            group_name=effective_group_name,
            points_awarded=effective_points,
            db=db,
            exclude_submission_id=submission_id
        )

    # 5. Persist
    db.table("submissions") \
        .update(update_payload) \
        .eq("id", submission_id) \
        .execute()


    return {
        "message": f"Submission {data.status} successfully.",
        "submission_id": submission_id,
        "status": data.status,
        "previous_status": previous_status
    }

@router.patch("/submissions/{submission_id}")
async def update_submission_metadata(
    submission_id: str,
    activity_id: Optional[str] = Form(None),
    points_awarded: Optional[float] = Form(None),
    academic_year: Optional[int] = Form(None),
    group_name: Optional[str] = Form(None),
    level: Optional[str] = Form(None),
    certificate_date: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    # 1. Fetch existing submission
    try:
        res = db.table("submissions") \
            .select("*") \
            .eq("id", submission_id) \
            .single() \
            .execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Submission not found.")
    
    submission = res.data
    await verify_admin_access(submission["batch_id"], current_user.id, db)

    # 2. Extract update fields
    update_payload = {
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    if activity_id: update_payload["activity_id"] = activity_id
    if points_awarded is not None: update_payload["points_awarded"] = points_awarded
    if academic_year: update_payload["academic_year"] = academic_year
    if group_name: update_payload["group_name"] = group_name
    if level: update_payload["level"] = level
    if certificate_date: update_payload["certificate_date"] = certificate_date

    # Handle file update
    if file:
        try:
            file_ext = file.filename.split(".")[-1]
            file_name = f"{submission['student_id']}/{submission_id}_{int(datetime.now().timestamp())}.{file_ext}"
            file_content = await file.read()
            
            db.storage.from_("activity-certificates").upload(
                path=file_name,
                file=file_content,
                file_options={"content-type": file.content_type}
            )
            
            public_url = db.storage.from_("activity-certificates").get_public_url(file_name)
            update_payload["certificate_url"] = public_url
        except Exception as e:
            print(f"File upload error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to upload new certificate: {str(e)}")

    activity_changed = "activity_id" in update_payload and update_payload["activity_id"] != submission["activity_id"]
    points_changed   = "points_awarded" in update_payload and update_payload["points_awarded"] != submission["points_awarded"]

    # 3. Validation if critical fields changed
    if activity_changed or points_changed:
        effective_activity_id = update_payload.get("activity_id", submission["activity_id"])
        effective_points      = update_payload.get("points_awarded", submission["points_awarded"])
        effective_level       = update_payload.get("level", submission["level"])

        rulebook = fetchRuleBook(db=db)
        effective_activity = validateActivity(rulebook, effective_activity_id)

        maxCheck_meritLevelValidation(
            points_awarded=effective_points,
            target_activity=effective_activity,
            level_key=effective_level
        )

        highLevel_winOverride(
            target_activity=effective_activity,
            student_id=submission["student_id"],
            activity_code=effective_activity_id,
            points_awarded=effective_points,
            db=db,
            exclude_submission_id=submission_id
        )

        cluster_cap(
            activity_code=effective_activity_id,
            db=db,
            student_id=submission["student_id"],
            rulebook=rulebook,
            points_awarded=effective_points,
            exclude_submission_id=submission_id
        )

        if activity_changed:
            update_payload["activity_name"] = effective_activity["title"]

    # 4. Save
    db.table("submissions") \
        .update(update_payload) \
        .eq("id", submission_id) \
        .execute()

    return {"message": "Submission updated successfully.", "updated_fields": list(update_payload.keys())}

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