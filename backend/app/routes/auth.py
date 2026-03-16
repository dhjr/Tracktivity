from fastapi import APIRouter, HTTPException, status,Depends,Query
from schemas.auth import LoginRequest, SignupRequest
from internal.session import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(credentials: LoginRequest,db=Depends(get_supabase)):
    try:
        response = db.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        return response.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/signup")
async def signup(credentials: SignupRequest,db=Depends(get_supabase)):
    try:
        user_metadata = {
            "name": credentials.name,
            "role": credentials.role,
            "department": credentials.department,
            "ktuId": credentials.ktuId,
        }
        if credentials.role == "student":
            user_metadata["isKtuVerified"] = False
            user_metadata["studentCategory"] = credentials.studentCategory

        response = db.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": {
                "data": user_metadata
            }
        })
        return response.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/check-ktu")
async def check_ktu(
    ktu_id: str = Query(..., alias="ktuId", min_length=3), 
    db=Depends(get_supabase)
):
    try:
        # Normalize to uppercase and use limit(1) for speed
        # We only care if data exists, not what the data is
        result = db.table("students") \
            .select("ktuid") \
            .eq("ktuid", ktu_id.upper()) \
            .limit(1) \
            .execute()

        # result.data will be an empty list [] if not found
        is_present = len(result.data) > 0
        
        return {"isPresent": is_present}

    except Exception as e:
        # In production, use a proper logger instead of print
        print(f"Error checking KTU ID: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Database validation failed"
        )