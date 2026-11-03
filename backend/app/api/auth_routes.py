import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.schemas.user_schema import UserLogin, UserRegister, TokenResponse, UserResponse
from backend.app.services.auth_service import auth_service
from backend.app.database.repositories.user_repo import user_repo
from backend.app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    user = auth_service.authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = auth_service.create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister):
    existing = user_repo.find_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    user_id = f"usr_{uuid.uuid4().hex[:7]}"
    now = datetime.now(timezone.utc).isoformat()
    hashed = auth_service.hash_password(payload.password)

    # Security: safe role assignment (always EMPLOYEE for public registration)
    new_user = {
        "id": user_id,
        "email": payload.email.lower().strip(),
        "password_hash": hashed,
        "name": payload.name,
        "role": "EMPLOYEE",
        "department": payload.department or "Engineering",
        "status": "ACTIVE",
        "created_at": now
    }
    user_repo.create(new_user)
    token = auth_service.create_access_token({"sub": user_id, "role": "EMPLOYEE"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/users")
def list_users():
    users = user_repo.list_all()
    # Strip password hash for security
    return [
        {
            "id": u["id"],
            "email": u["email"],
            "name": u["name"],
            "role": u["role"],
            "department": u.get("department", "Operations"),
            "status": u.get("status", "ACTIVE"),
            "created_at": u.get("created_at")
        }
        for u in users
    ]

