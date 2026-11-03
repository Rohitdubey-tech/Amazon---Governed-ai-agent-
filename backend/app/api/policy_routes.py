from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.policy_schema import PolicyResponse, PolicyUpdate
from backend.app.database.repositories.policy_repo import policy_repo
from backend.app.database.repositories.audit_repo import audit_repo
from backend.app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/policies", tags=["Deterministic Policy Engine"])

@router.get("", response_model=List[PolicyResponse])
def list_policies():
    return policy_repo.list_all()

@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy(policy_id: str):
    pol = policy_repo.find_by_id(policy_id)
    if not pol:
        raise HTTPException(status_code=404, detail="Policy not found")
    return pol

@router.patch("/{policy_id}/toggle", response_model=PolicyResponse)
def toggle_policy(policy_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="PERMISSION_DENIED: Only ADMIN can toggle policies.")
    
    pol = policy_repo.find_by_id(policy_id)
    if not pol:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    new_active = not pol.get("active", True)
    now_iso = datetime.now(timezone.utc).isoformat()
    updated = policy_repo.update_policy(policy_id, {
        "active": new_active,
        "updated_at": now_iso,
        "updated_by": f"{current_user.get('name')} (ADMIN)"
    })

    audit_repo.log({
        "id": f"aud_pol_{policy_id[-4:]}",
        "correlation_id": "corr_admin_pol_toggle",
        "timestamp": now_iso,
        "actor": f"user:{current_user.get('email')}",
        "actor_type": "USER_ADMIN",
        "action": "TOGGLE_POLICY",
        "resource": f"policy:{pol.get('policy_code')}",
        "governance_decision": "ALLOW",
        "reason_codes": ["ADMIN_RBAC_VERIFIED"],
        "details": f"Admin {current_user.get('name')} set {pol.get('policy_code')} active state to {new_active}."
    })
    return updated

@router.put("/{policy_id}", response_model=PolicyResponse)
def update_policy(
    policy_id: str,
    payload: PolicyUpdate,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="PERMISSION_DENIED: Only ADMIN can update policies.")

    pol = policy_repo.find_by_id(policy_id)
    if not pol:
        raise HTTPException(status_code=404, detail="Policy not found")

    updates = {}
    if payload.threshold is not None:
        updates["threshold"] = payload.threshold
        # Bump version string e.g. v2.1.0 -> v2.2.0
        v_num = float(pol.get("version", "v1.0.0").replace("v", "").rsplit(".", 1)[0])
        updates["version"] = f"v{v_num + 0.1:.1f}.0"

    if payload.description:
        updates["description"] = payload.description

    now_iso = datetime.now(timezone.utc).isoformat()
    updates["updated_at"] = now_iso
    updates["updated_by"] = f"{current_user.get('name')} (ADMIN)"

    updated = policy_repo.update_policy(policy_id, updates)
    return updated

