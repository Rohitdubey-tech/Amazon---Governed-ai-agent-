from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AgentStep(BaseModel):
    step: int
    agent: str
    desc: str
    status: str
    output: Optional[Dict[str, Any]] = None

class TaskCreate(BaseModel):
    prompt: str = Field(..., min_length=3)
    receipt_name: Optional[str] = "expense_receipt.pdf"
    amount: Optional[float] = None
    merchant: Optional[str] = None
    category: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    prompt: str
    receipt_name: str
    status: str
    plan: List[AgentStep]
    governance_decision: str
    claim_id: Optional[str] = None
    approval_id: Optional[str] = None
    action_hash: Optional[str] = None
    risk_score: int
    risk_level: str
    risk_factors: List[str]
    created_at: str
    completed_at: Optional[str] = None

