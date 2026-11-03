from typing import Optional
from pydantic import BaseModel, Field

class ClaimCreate(BaseModel):
    merchant: str
    amount: float = Field(..., gt=0)
    currency: str = "INR"
    category: str
    receipt_name: Optional[str] = "receipt.pdf"
    notes: Optional[str] = None

class ClaimResponse(BaseModel):
    id: str
    task_id: Optional[str] = "tsk_manual"
    user_id: Optional[str] = "usr_system"
    user_name: Optional[str] = "System User"
    user_email: Optional[str] = "system@shieldcorp.io"
    merchant: str
    amount: float
    currency: str = "INR"
    category: Optional[str] = "General"
    date: Optional[str] = "2026-11-03"
    receipt_id: Optional[str] = "rcpt_placeholder"
    receipt_name: Optional[str] = "receipt.pdf"
    status: str = "DRAFT"
    governance_decision: Optional[str] = "ALLOW"
    approval_id: Optional[str] = None
    risk_score: Optional[int] = 15
    risk_level: Optional[str] = "LOW"
    block_reason: Optional[str] = None
    action_hash: Optional[str] = None
    created_at: Optional[str] = None
    executed_at: Optional[str] = None

