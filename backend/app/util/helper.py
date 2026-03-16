from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form



def fetchRuleBook(db):
    rulebook_res = db.table("activity_rulebook").select("data").eq("id", 1).single().execute()
    if not rulebook_res.data:
        raise HTTPException(status_code=500, detail="Rulebook configuration missing")
    
    rulebook = rulebook_res.data["data"]
    return rulebook 


def validateActivity(rulebook,activity_code):
    target_activity = None
    for cat in rulebook["categories"]:
        for act in cat["activities"]:
            if act["code"] == activity_code:
                target_activity = act
                break
    
    if not target_activity:
        raise HTTPException(status_code=400, detail="Invalid Activity Code")
    return target_activity

def maxCheck_meritLevelValidation(points_awarded, target_activity,level_key):
      # individual max check
      if points_awarded > target_activity["maxPoints"]:
        raise HTTPException(status_code=400, detail=f"Exceeds max limit of {target_activity['maxPoints']}")

    # Level-based validation
      if target_activity.get("calculationType") == "LEVEL" and level_key:
        allowed = target_activity["levels"].get(level_key.lower())
        if allowed is not None and points_awarded > allowed:
             raise HTTPException(status_code=400, detail=f"Max points for {level_key} is {allowed}")
    
    # Fixed-point validation
      elif target_activity.get("calculationType") == "FIXED":
        if points_awarded > target_activity["points"]:
             raise HTTPException(status_code=400, detail="Points exceed fixed value for this activity")

def highLevel_winOverride(target_activity,student_id,activity_code,points_awarded,db,exclude_submission_id=None):
    activity_title = target_activity["title"] # Use the title from rulebook for consistent querying
    
    rules = target_activity.get("rules", [])
    if "HIGHEST_LEVEL_ONLY" in rules or "WIN_OVERRIDES_PARTICIPATION" in rules:
        existing_event = db.table("submissions")\
            .select("points_awarded, status")\
            .eq("student_id", student_id)\
            .eq("activity_id", activity_code)\
            .neq("status", "rejected")
        
        if exclude_submission_id:
             existing_event = existing_event.neq("id", exclude_submission_id)  

        existing_event = existing_event.execute()

        for entry in existing_event.data:
            if points_awarded <= entry["points_awarded"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Higher/Equal achievement ({entry['points_awarded']} pts) already exists for this activity."
                )
            
def cluster_cap(activity_code,db, student_id, rulebook,points_awarded,exclude_submission_id=None):
    relevant_cap = next((c for c in rulebook["capGroups"] if activity_code in c["codes"]), None)
    
    if relevant_cap:
        existing_cluster = db.table("submissions")\
            .select("points_awarded")\
            .eq("student_id", student_id)\
            .in_("activity_id", relevant_cap["codes"])\
            .neq("status", "rejected")
        if exclude_submission_id:
             existing_cluster = existing_cluster.neq("id", exclude_submission_id)
        existing_cluster = existing_cluster.execute()
        
        current_total = sum(s["points_awarded"] for s in existing_cluster.data)
        if current_total + points_awarded > relevant_cap["maxPoints"]:
            allowed = relevant_cap["maxPoints"] - current_total
            raise HTTPException(status_code=400, detail=f"Cluster cap reached. Max allowed remaining: {allowed}")



STUDENT_TYPE_LIMITS = {
    "regular":      {"total": 120, "per_group": 40},
    "lateralEntry": {"total": 90,  "per_group": 30},
    "pwd":          {"total": 60,  "per_group": 20},
}

GROUP_COLUMN_MAP = {
    "GROUP_I":   "grp1_points",
    "GROUP_II":  "grp2_points",
    "GROUP_III": "grp3_points"
}

def group_cap_check(student_id, group_name, points_awarded, db, exclude_submission_id=None):
    # Fetch student type and current group points
    try:
        student_res = db.table("students") \
            .select("student_type, grp1_points, grp2_points, grp3_points") \
            .eq("id", student_id) \
            .single() \
            .execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Student not found.")

    student = student_res.data
    student_type = student.get("student_type", "regular")
    limits = STUDENT_TYPE_LIMITS.get(student_type, STUDENT_TYPE_LIMITS["regular"])
    per_group_limit = limits["per_group"]

    column = GROUP_COLUMN_MAP.get(group_name)
    if not column:
        raise HTTPException(status_code=400, detail=f"Unknown group name: {group_name}")

    current_group_points = student[column]

    # If this is a re-verification, subtract the old approved points first
    # so we don't double-count the submission being updated
    if exclude_submission_id:
        old_res = db.table("submissions") \
            .select("points_awarded, status, group_name") \
            .eq("id", exclude_submission_id) \
            .single() \
            .execute()

        if old_res.data and old_res.data["status"] == "approved" \
                and old_res.data["group_name"] == group_name:
            current_group_points -= old_res.data["points_awarded"]

    if current_group_points + points_awarded > per_group_limit:
        allowed = per_group_limit - current_group_points
        raise HTTPException(
            status_code=400,
            detail=f"Group cap exceeded. {student_type} students can earn max {per_group_limit} pts in {group_name}. "
                   f"Current: {current_group_points}, Allowed remaining: {allowed}"
        )
    