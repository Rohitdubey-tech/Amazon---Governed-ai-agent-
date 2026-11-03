from typing import List, Optional
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: str
    correlation_id: str
    timestamp: str
    actor: str
    actor_type: str
    action: str
    resource: str
    governance_decision: str
    reason_codes: List[str]
    details: str

