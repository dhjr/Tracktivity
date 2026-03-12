from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from internal.session import get_supabase
from typing import Optional
from datetime import date
import uuid
import shutil
from pathlib import Path
from util.helper import fetchRuleBook, maxCheck_meritLevelValidation, validateActivity, highLevel_winOverride, cluster_cap
from datetime import datetime
from enum import Enum


app = APIRouter()

# 1. Define View Options for Type Safety
class DashboardView(str, Enum):
    SUMMARY = "summary"
    APPROVED = "approved"
    PENDING = "pending"
    REJECTED = "rejected"
    ALL = "all"

@app.post("/student/submit")
async def create_submission(
    activity_code: str = Form(...),  # e.g., "1.1"
    group_name: str = Form(...),     # e.g., "GROUP_I"
    points_awarded: int = Form(...), 
    level_key: Optional[str] = Form(None), 
    student_id: str = Form(...),     # Get from token in future
    academic_year: int = Form(...), 
    file: UploadFile = File(...),
    db=Depends(get_supabase)
):

    ## fetching the rule book for prevalidation
    rulebook = fetchRuleBook(db=db)

    print("rule book fetch successfull!!")
    # --- 2. VALIDATE ACTIVITY CODE ---
    target_activity = validateActivity(rulebook=rulebook,activity_code=activity_code)

    print("activity code  successfull!!")
    # --- 3. MERIT & LEVEL VALIDATION ---
    # Individual Max Check
    maxCheck_meritLevelValidation(points_awarded=points_awarded, target_activity=target_activity, level_key=level_key)

    print("Merit validation successfull!!")
    # --- 4. SPECIAL RULES (HIGHEST LEVEL / WIN OVERRIDES) ---
    highLevel_winOverride(target_activity,student_id,activity_code,points_awarded,db)

    print("Cluster caps successfull!!")
    # --- 5. CLUSTER CAPS (e.g., NSS/NCC cap at 40) ---
    cluster_cap(activity_code,db, student_id, rulebook,points_awarded)

    
    # --- 6. FILE UPLOAD ---
# --- 6. FILE UPLOAD ---
    try:
      file_ext = file.filename.split(".")[-1]
      file_path = f"certificates/{student_id}/{uuid.uuid4()}.{file_ext}"
      file_content = await file.read()
      print("file read successful !!")
    
      response = db.storage.from_("activity-certificates").upload(
        path=file_path, 
        file=file_content,
        file_options={"content-type": file.content_type}
      )
    
      print("Upload response:", response)  # Add this to debug
    
      certificate_url = db.storage.from_("activity-certificates").get_public_url(file_path)

    except Exception as e:
         print(f"Storage error: {e}")  # ← Add this so you can see the real error
         raise HTTPException(status_code=500, detail="Storage service error")
    
    print("activity certificate url obtained successully")
    # --- 7. DATABASE PERSISTENCE ---
    student_info = db.table("students").select("batch_id").eq("id", student_id).execute()
    if not student_info.data:
         raise HTTPException(status_code=404, detail="Student profile not found")
    batch_id = student_info.data[0]["batch_id"]
    print("Student info obtained successfully")

    submission_data = {
        "student_id": student_id,
        "batch_id": batch_id,
        "activity_id": activity_code,
        "activity_name": target_activity["title"],
        "group_name": group_name,
        "points_awarded": points_awarded,
        "academic_year": academic_year,
        "level": level_key,
        "certificate_url": certificate_url,
        "certificate_date": datetime.now().date().isoformat(), 
        "status": "pending"
    }

    db.table("submissions").insert(submission_data).execute()
    return {"message": "Success! Submission is pending faculty review."}    


@app.get("/student/{student_id}/summary")
async def get_student_summary(student_id: str, db=Depends(get_supabase)):
    # Fetch all approved submissions to calculate points
    response = db.table("submissions")\
        .select("points_awarded, group_name")\
        .eq("student_id", student_id)\
        .eq("status", "approved")\
        .execute()
    
    # Fetch basic student details
    student_details = db.table("students").select("full_name, ktuid").eq("id", student_id).single().execute()

    # Basic summation logic
    total_points = sum(item['points_awarded'] for item in response.data)
    
    return {
        "student": student_details.data,
        "total_approved_points": total_points,
        "breakdown": response.data
    }

from internal.dependencies import require_role

# obtain list of batches enrolled by a student
@app.get("/student/my-batches")
async def get_my_batches(
    db=Depends(get_supabase),
    current_user=Depends(require_role("student"))
):
    try:
        student_res = db.table("students").select("batch_id").eq("id", current_user.id).single().execute()
        if not student_res.data or not student_res.data.get("batch_id"):
            return {"batches": []}
            
        batch_id = student_res.data["batch_id"]
        batch_res = db.table("batches").select("id, name, batch_code, created_at, created_by").eq("id", batch_id).single().execute()
        
        if not batch_res.data:
            return {"batches": []}
            
        batch = batch_res.data
        batch["enrolled_at"] = batch["created_at"]
        batch["status"] = "approved"
        
        return {"batches": [batch]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/student/dashboard")
async def get_dashboard_data(
    view: DashboardView = DashboardView.SUMMARY,
    db=Depends(get_supabase),
    current_user=Depends(require_role("student"))
):
    student_id = current_user.id
    
    # Base query for this specific student
    query = db.table("submissions").select("*").eq("student_id", student_id)

    # 2. Handle the "Summary" View (Calculates points)
    if view == DashboardView.SUMMARY:
        # Fetching only points_awarded to calculate the current progress efficiently
        res = db.table("submissions").select("points_awarded").eq("student_id", student_id).eq("status", "approved").execute()
        total_points = sum(item['points_awarded'] for item in res.data)
        
        # Quick count of pending items for the summary badge
        pending_count = db.table("submissions")\
            .select("id", count="exact")\
            .eq("student_id", student_id)\
            .eq("status", "pending")\
            .limit(1)\
            .execute()

        return {
            "view": "summary",
            "student_id": student_id,
            "total_approved_points": total_points,
            "pending_count": pending_count.count or 0,
            "recent_approved": res.data[:5] # Just show the last 5
        }

    # 3. Handle Subset Views (Approved, Pending, Rejected, All)
    if view != DashboardView.ALL:
        query = query.eq("status", view.value)
    
    response = query.order("created_at", desc=True).execute()
    
    return {
        "view": view.value,
        "count": len(response.data),
        "submissions": response.data
    }
@app.get("/student/submissions/{submission_id}")
async def get_submission_detail(
    submission_id: str,
    db=Depends(get_supabase),
    current_user=Depends(require_role("student"))
):
    student_id = current_user.id
    
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
        .eq("student_id", student_id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Submission not found.")

    submission = res.data

    # Fetch rulebook details for the activity
    rulebook = fetchRuleBook(db=db)
    target_activity = validateActivity(rulebook=rulebook, activity_code=submission["activity_id"])
    
    return {
        "submission": submission,
        "rule": target_activity
    }
