from fastapi import APIRouter, Depends, HTTPException
from internal.session import get_supabase
from internal.dependencies import require_role
from util.helper import fetchRuleBook

router = APIRouter(prefix="/rulebook", tags=["Rulebook"])

@router.get("/")
async def get_activity_rulebook(
    db=Depends(get_supabase)
    # We might want to restrict this or leave it open for both students and faculty
):
    try:
        # Fetch the rulebook data using the existing helper
        rulebook = fetchRuleBook(db=db)
        return {"rulebook": rulebook}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch rulebook: {str(e)}")
