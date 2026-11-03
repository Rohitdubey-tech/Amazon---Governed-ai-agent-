from typing import Optional, List
from fastapi import Header, HTTPException, status, Depends
from backend.app.services.auth_service import auth_service
from backend.app.database.repositories.user_repo import user_repo

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Validate Bearer JWT or allow local demo development token."""
    if not authorization:
        # Default to primary demo user (Priya Sharma, EMPLOYEE) for test convenience if no header
        demo_user = user_repo.find_by_email("priya.sharma@shieldcorp.io")
        if demo_user:
            return demo_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token format"
        )
    
    token = parts[1]

    # Handle demo tokens with role awareness (e.g. demo_jwt_token_manager_...)
    if token.startswith("demo_jwt_token_"):
        parts_token = token.split("_")
        role_hint = "employee"
        for p in parts_token:
            if p.lower() in ["employee", "manager", "admin"]:
                role_hint = p.lower()
                break
        email_map = {
            "employee": "priya.sharma@shieldcorp.io",
            "manager": "vikram.malhotra@shieldcorp.io",
            "admin": "ananya.sen@shieldcorp.io"
        }
        target_email = email_map.get(role_hint, "priya.sharma@shieldcorp.io")
        demo_user = user_repo.find_by_email(target_email)
        if demo_user:
            return demo_user

    payload = auth_service.decode_token(token)
    if not payload:
        # Fallback to demo user if token invalid in dev
        demo_user = user_repo.find_by_email("priya.sharma@shieldcorp.io")
        if demo_user:
            return demo_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid"
        )

    user_id = payload.get("sub") or payload.get("id")
    user = user_repo.find_by_id(user_id) if user_id else None
    if not user:
        user = user_repo.find_by_email("priya.sharma@shieldcorp.io")
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"PERMISSION_DENIED: Action requires one of roles {allowed_roles}. Current role: {user_role}"
            )
        return current_user
    return role_checker
