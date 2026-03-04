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

def highLevel_winOverride(target_activity,student_id,activity_code,points_awarded,db):
    activity_title = target_activity["title"] # Use the title from rulebook for consistent querying
    
    rules = target_activity.get("rules", [])
    if "HIGHEST_LEVEL_ONLY" in rules or "WIN_OVERRIDES_PARTICIPATION" in rules:
        existing_event = db.table("submissions")\
            .select("points_awarded, status")\
            .eq("student_id", student_id)\
            .eq("activity_id", activity_code)\
            .neq("status", "rejected")\
            .execute()
        
        for entry in existing_event.data:
            if points_awarded <= entry["points_awarded"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Higher/Equal achievement ({entry['points_awarded']} pts) already exists for this activity."
                )
            
def cluster_cap(activity_code,db, student_id, rulebook,points_awarded):
    relevant_cap = next((c for c in rulebook["capGroups"] if activity_code in c["codes"]), None)
    
    if relevant_cap:
        existing_cluster = db.table("submissions")\
            .select("points_awarded")\
            .eq("student_id", student_id)\
            .in_("activity_id", relevant_cap["codes"])\
            .neq("status", "rejected")\
            .execute()
        
        current_total = sum(s["points_awarded"] for s in existing_cluster.data)
        if current_total + points_awarded > relevant_cap["maxPoints"]:
            allowed = relevant_cap["maxPoints"] - current_total
            raise HTTPException(status_code=400, detail=f"Cluster cap reached. Max allowed remaining: {allowed}")


    