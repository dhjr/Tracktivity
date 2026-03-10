from fastapi import APIRouter, HTTPException, status,Depends
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

@router.post("/check-ktu")
async def check_ktu(req: dict, db=Depends(get_supabase)):
    ktu_id = req.get("ktuId")
    if not ktu_id:
        raise HTTPException(
            status_code=400, 
            detail="KTU ID is required"
        )
    
    try:
        # 1. Query the 'students' table specifically for this ID
        # 2. Case-insensitive check using '.ilike' or '.eq' with .upper()
        result = db.table("students") \
            .select("ktuid") \
            .eq("ktuid", ktu_id.upper()) \
            .execute()

        # If result.data is empty, the ID is unique
        is_unique = len(result.data) == 0
        
        return {"isPresentInDB": not is_unique}

    except Exception as e:
        # Log the actual error on your server for debugging
        print(f"Error checking KTU ID: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error during validation"
        )