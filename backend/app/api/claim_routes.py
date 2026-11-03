from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.claim_schema import ClaimResponse
from backend.app.database.repositories.claim_repo import claim_repo
from backend.app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/claims", tags=["Simulated Expense Claims"])

@router.get("", response_model=List[ClaimResponse])
def list_claims(
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    claims = claim_repo.list_all()
    # RBAC Resource-scope enforcement: Employees only access their own claims
    if current_user.get("role") == "EMPLOYEE":
        claims = [c for c in claims if c.get("user_id") == current_user.get("id")]
    if category:
        claims = [c for c in claims if c.get("category", "").lower() == category.lower()]
    if status:
        claims = [c for c in claims if c.get("status", "").upper() == status.upper()]
    return claims

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: str, current_user: dict = Depends(get_current_user)):
    claim = claim_repo.find_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    # Resource ownership check: Employee forbidden from viewing other employees' claims
    if current_user.get("role") == "EMPLOYEE" and claim.get("user_id") != current_user.get("id"):
        raise HTTPException(
            status_code=403,
            detail="PERMISSION_DENIED: Cannot access another employee's claim"
        )
    return claim

