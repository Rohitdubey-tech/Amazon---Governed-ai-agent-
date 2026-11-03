from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from backend.app.database.mongodb import db_manager

class ApprovalRepository:
    def __init__(self):
        self._seed_initial_approvals()

    @property
    def col(self):
        return db_manager.get_collection("approvals")

    def _seed_initial_approvals(self):
        if self.col.count_documents() == 0:
            now = datetime.now(timezone.utc)
            now_iso = now.isoformat()
            exp_iso = (now + timedelta(days=3)).isoformat()
            initial_approvals = [
                {
                    "id": "appr_9901",
                    "task_id": "tsk_7725",
                    "claim_id": "clm_8942",
                    "requester_id": "usr_emp_01",
                    "requester_name": "Priya Sharma",
                    "requester_email": "priya.sharma@shieldcorp.io",
                    "proposed_action": {
                        "operation": "SUBMIT_EXPENSE_CLAIM",
                        "amount": 14200.0,
                        "currency": "INR",
                        "merchant": "Apple Authorized Reseller",
                        "category": "Hardware",
                        "receipt_id": "rcpt_appl_441",
                        "idempotency_key": "idem_act_apple_14200_9901"
                    },
                    "action_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "trigger_rule": "POL-THR-03 (Amount ₹14,200 exceeds ₹5,000 threshold)",
                    "risk_score": 65,
                    "risk_level": "MEDIUM",
                    "risk_factors": [
                        "Amount ₹14,200 is 184% over base manager review limit (₹5,000)",
                        "High-value hardware category with secondary asset tracking requirement",
                        "First hardware purchase submitted in current quarter"
                    ],
                    "status": "PENDING",
                    "created_at": now_iso,
                    "expires_at": exp_iso,
                    "consumed": False,
                    "approver_id": None,
                    "approver_name": None,
                    "approval_reason": None,
                    "rejection_reason": None,
                    "resolved_at": None
                }
            ]
            for a in initial_approvals:
                self.col.insert_one(a)

    def list_all(self) -> List[Dict[str, Any]]:
        return self.col.find()

    def list_pending(self) -> List[Dict[str, Any]]:
        return self.col.find({"status": "PENDING"})

    def find_by_id(self, approval_id: str) -> Optional[Dict[str, Any]]:
        return self.col.find_one({"id": approval_id})

    def create(self, approval_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.col.insert_one(approval_dict)
        return approval_dict

    def update_approval(self, approval_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        self.col.update_one({"id": approval_id}, {"$set": updates})
        return self.find_by_id(approval_id)

approval_repo = ApprovalRepository()

