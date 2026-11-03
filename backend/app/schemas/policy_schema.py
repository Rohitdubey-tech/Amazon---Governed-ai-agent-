from typing import Optional, List
from pydantic import BaseModel, Field

class PolicyRuleType(str):
    THRESHOLD_APPROVAL = "THRESHOLD_APPROVAL"
    MANDATORY_DOCUMENT = "MANDATORY_DOCUMENT"
    CATEGORY_RESTRICTION = "CATEGORY_RESTRICTION"
    DUPLICATE_DETECTION = "DUPLICATE_DETECTION"
    RISK_MODIFIER = "RISK_MODIFIER"

class PolicyCreate(BaseModel):
    policy_code: str
    name: str
    description: str
    rule_type: str
    threshold: Optional[float] = None
    currency: Optional[str] = "INR"
    prohibited_categories: Optional[List[str]] = None
    time_window_days: Optional[int] = 90
    enforcement: str = "REQUIRE_APPROVAL"
    active: bool = True

class PolicyUpdate(BaseModel):
    threshold: Optional[float] = None
    active: Optional[bool] = None
    description: Optional[str] = None
    prohibited_categories: Optional[List[str]] = None

class PolicyResponse(BaseModel):
    id: str
    policy_code: str
    name: str
    description: str
    rule_type: str
    threshold: Optional[float] = None
    currency: Optional[str] = "INR"
    prohibited_categories: Optional[List[str]] = None
    time_window_days: Optional[int] = None
    enforcement: str
    active: bool
    version: str
    updated_at: str
    updated_by: str

