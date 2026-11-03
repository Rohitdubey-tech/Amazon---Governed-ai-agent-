from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from backend.app.database.mongodb import db_manager

class PolicyRepository:
    def __init__(self):
        self._seed_initial_policies()

    @property
    def col(self):
        return db_manager.get_collection("policies")

    def _seed_initial_policies(self):
        if self.col.count_documents() == 0:
            now = datetime.now(timezone.utc).isoformat()
            initial_policies = [
                {
                    "id": "pol_rec_001",
                    "policy_code": "POL-REC-01",
                    "name": "Receipt Mandatory Policy",
                    "description": "Every claimed expense must have an authentic, verifiable receipt attached with OCR extraction confidence >= 70%.",
                    "rule_type": "MANDATORY_DOCUMENT",
                    "threshold": None,
                    "currency": "INR",
                    "prohibited_categories": None,
                    "time_window_days": None,
                    "enforcement": "HARD_DENY",
                    "active": True,
                    "version": "v1.2.0",
                    "updated_at": now,
                    "updated_by": "Ananya Sen (ADMIN)"
                },
                {
                    "id": "pol_pers_002",
                    "policy_code": "POL-CAT-02",
                    "name": "Prohibition of Personal Expenses",
                    "description": "Personal entertainment, gaming, luxury retail, or non-business items are strictly prohibited.",
                    "rule_type": "CATEGORY_RESTRICTION",
                    "threshold": None,
                    "currency": "INR",
                    "prohibited_categories": ["Personal", "Gaming", "Luxury", "Crypto"],
                    "time_window_days": None,
                    "enforcement": "HARD_DENY",
                    "active": True,
                    "version": "v1.0.1",
                    "updated_at": now,
                    "updated_by": "Ananya Sen (ADMIN)"
                },
                {
                    "id": "pol_thr_003",
                    "policy_code": "POL-THR-03",
                    "name": "Manager Approval Threshold Limit",
                    "description": "Single expense claims exceeding ₹5,000 require independent managerial authorization before execution.",
                    "rule_type": "THRESHOLD_APPROVAL",
                    "threshold": 5000.0,
                    "currency": "INR",
                    "prohibited_categories": None,
                    "time_window_days": None,
                    "enforcement": "REQUIRE_APPROVAL",
                    "active": True,
                    "version": "v2.1.0",
                    "updated_at": now,
                    "updated_by": "Ananya Sen (ADMIN)"
                },
                {
                    "id": "pol_dup_004",
                    "policy_code": "POL-DUP-04",
                    "name": "Duplicate Claim & Fingerprint Ban",
                    "description": "Re-submission of identical receipt file hashes or matching merchant + date + amount combinations within 90 days is rejected.",
                    "rule_type": "DUPLICATE_DETECTION",
                    "threshold": None,
                    "currency": "INR",
                    "prohibited_categories": None,
                    "time_window_days": 90,
                    "enforcement": "HARD_DENY",
                    "active": True,
                    "version": "v1.3.0",
                    "updated_at": now,
                    "updated_by": "Ananya Sen (ADMIN)"
                }
            ]
            for p in initial_policies:
                self.col.insert_one(p)

    def list_all(self) -> List[Dict[str, Any]]:
        return self.col.find()

    def find_by_id(self, policy_id: str) -> Optional[Dict[str, Any]]:
        return self.col.find_one({"id": policy_id})

    def find_by_code(self, policy_code: str) -> Optional[Dict[str, Any]]:
        return self.col.find_one({"policy_code": policy_code})

    def update_policy(self, policy_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        self.col.update_one({"id": policy_id}, {"$set": updates})
        return self.find_by_id(policy_id)

    def create(self, policy_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.col.insert_one(policy_dict)
        return policy_dict

policy_repo = PolicyRepository()

