from fastapi import APIRouter, HTTPException, status,Depends
from app.schemas.auth import LoginRequest, SignupRequest
from app.internal.session import get_supabase

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
