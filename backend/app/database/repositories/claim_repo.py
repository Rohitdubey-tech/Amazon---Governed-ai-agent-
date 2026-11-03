from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from backend.app.database.mongodb import db_manager

class ClaimRepository:
    def __init__(self):
        self._seed_initial_claims()

    @property
    def col(self):
        return db_manager.get_collection("expense_claims")

    def _seed_initial_claims(self):
        if self.col.count_documents() == 0:
            now = datetime.now(timezone.utc).isoformat()
            initial_claims = [
                {
                    "id": "clm_8941",
                    "task_id": "tsk_7721",
                    "user_id": "usr_emp_01",
                    "user_name": "Priya Sharma",
                    "user_email": "priya.sharma@shieldcorp.io",
                    "merchant": "IndiGo Airlines",
                    "amount": 4500.0,
                    "currency": "INR",
                    "category": "Travel",
                    "date": "2026-11-01",
                    "receipt_id": "rcpt_indi_992",
                    "receipt_name": "indigo_flight_del_blr.pdf",
                    "status": "PROCESSED",
                    "governance_decision": "ALLOW",
                    "approval_id": None,
                    "risk_score": 18,
                    "risk_level": "LOW",
                    "block_reason": None,
                    "action_hash": "a1b2c3d4e5f60102030405060708090a1b2c3d4e5f60102030405060708090a1",
                    "created_at": now,
                    "executed_at": now
                },
                {
                    "id": "clm_8942",
                    "task_id": "tsk_7725",
                    "user_id": "usr_emp_01",
                    "user_name": "Priya Sharma",
                    "user_email": "priya.sharma@shieldcorp.io",
                    "merchant": "Apple Authorized Reseller",
                    "amount": 14200.0,
                    "currency": "INR",
                    "category": "Hardware",
                    "date": "2026-11-02",
                    "receipt_id": "rcpt_appl_441",
                    "receipt_name": "usb_c_monitor_dock.pdf",
                    "status": "WAITING_FOR_APPROVAL",
                    "governance_decision": "REQUIRE_APPROVAL",
                    "approval_id": "appr_9901",
                    "risk_score": 65,
                    "risk_level": "MEDIUM",
                    "block_reason": None,
                    "action_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "created_at": now,
                    "executed_at": None
                },
                {
                    "id": "clm_8943",
                    "task_id": "tsk_7729",
                    "user_id": "usr_emp_01",
                    "user_name": "Priya Sharma",
                    "user_email": "priya.sharma@shieldcorp.io",
                    "merchant": "PlayStation Network Store",
                    "amount": 3999.0,
                    "currency": "INR",
                    "category": "Personal / Gaming",
                    "date": "2026-10-30",
                    "receipt_id": "rcpt_psn_110",
                    "receipt_name": "psn_receipt_oct.jpg",
                    "status": "BLOCKED",
                    "governance_decision": "DENY",
                    "approval_id": None,
                    "risk_score": 92,
                    "risk_level": "HIGH",
                    "block_reason": "Violation of POL-CAT-02: Personal/Gaming expense prohibited.",
                    "action_hash": None,
                    "created_at": now,
                    "executed_at": None
                }
            ]
            for c in initial_claims:
                self.col.insert_one(c)

    def list_all(self) -> List[Dict[str, Any]]:
        return self.col.find()

    def find_by_id(self, claim_id: str) -> Optional[Dict[str, Any]]:
        return self.col.find_one({"id": claim_id})

    def find_duplicate(self, merchant: str, amount: float) -> Optional[Dict[str, Any]]:
        return self.col.find_one({
            "merchant": merchant,
            "amount": amount,
            "status": "PROCESSED"
        })

    def create(self, claim_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.col.insert_one(claim_dict)
        return claim_dict

    def update_claim(self, claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        self.col.update_one({"id": claim_id}, {"$set": updates})
        return self.find_by_id(claim_id)

claim_repo = ClaimRepository()

