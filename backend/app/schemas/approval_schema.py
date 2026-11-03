from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

class ApprovalActionRequest(BaseModel):
    reason: str = Field(..., min_length=3)

class ApprovalResponse(BaseModel):
    id: str
    task_id: str
    claim_id: str
    requester_id: str
    requester_name: str
    requester_email: str
    proposed_action: Dict[str, Any]
    action_hash: str
    trigger_rule: str
    risk_score: int
    risk_level: str
    risk_factors: List[str]
    status: str
    created_at: str
    expires_at: str
    consumed: bool
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    approval_reason: Optional[str] = None
    rejection_reason: Optional[str] = None
    resolved_at: Optional[str] = None

