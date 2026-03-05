from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.internal.session import get_supabase
from typing import Optional
from datetime import date
import uuid
import shutil
from pathlib import Path
from util.helper import fetchRuleBook, maxCheck_meritLevelValidation, validateActivity, highLevel_winOverride, cluster_cap
from datetime import datetime

app = APIRouter()

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
    
    print("activity certifiacte url obtained successully")
    # --- 7. DATABASE PERSISTENCE ---
    student_info = db.table("students").select("batch_id").eq("id", student_id).single().execute()
    if not student_info.data:
         raise HTTPException(status_code=404, detail="Student profile not found")
    
    print("Student info obtained successfully")

    submission_data = {
        "student_id": student_id,
        "batch_id": student_info.data["batch_id"],
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
