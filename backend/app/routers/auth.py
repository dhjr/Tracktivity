from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, SignupRequest
from app.db.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(credentials: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
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
async def signup(credentials: SignupRequest):
    try:
        user_metadata = {
            "name": credentials.name,
            "role": credentials.role,
            "ktuId": credentials.ktuId,
        }
        if credentials.role == "student":
            user_metadata["isKtuVerified"] = False

        response = supabase.auth.sign_up({
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
