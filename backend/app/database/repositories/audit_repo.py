from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from backend.app.database.mongodb import db_manager

class AuditRepository:
    def __init__(self):
        self._seed_initial_audits()

    @property
    def col(self):
        return db_manager.get_collection("audit_logs")

    def _seed_initial_audits(self):
        if self.col.count_documents() == 0:
            now = datetime.now(timezone.utc).isoformat()
            initial_audits = [
                {
                    "id": "aud_1001",
                    "correlation_id": "corr_91823719",
                    "timestamp": now,
                    "actor": "agent:ExecutionAgent",
                    "actor_type": "AGENT",
                    "action": "PROPOSE_SENSITIVE_TOOL_EXECUTION",
                    "resource": "tool:submit_simulated_claim",
                    "governance_decision": "ALLOW",
                    "reason_codes": ["POL_REC_PASS", "POL_CAT_PASS", "UNDER_THRESHOLD"],
                    "details": "Governance Gateway approved execution for Claim clm_8941 (₹4,500 INR). All deterministic rules passed."
                },
                {
                    "id": "aud_1002",
                    "correlation_id": "corr_91823788",
                    "timestamp": now,
                    "actor": "agent:ExecutionAgent",
                    "actor_type": "AGENT",
                    "action": "PROPOSE_SENSITIVE_TOOL_EXECUTION",
                    "resource": "tool:submit_simulated_claim",
                    "governance_decision": "REQUIRE_APPROVAL",
                    "reason_codes": ["POL_THR_03_TRIGGERED"],
                    "details": "Threshold ₹5,000 exceeded (Amount: ₹14,200). Paused graph state. Approval appr_9901 created with cryptographic hash binding."
                },
                {
                    "id": "aud_1003",
                    "correlation_id": "corr_91823812",
                    "timestamp": now,
                    "actor": "gateway:PolicyEngine",
                    "actor_type": "GOVERNANCE",
                    "action": "EVALUATE_POLICY",
                    "resource": "claim:clm_8943",
                    "governance_decision": "DENY",
                    "reason_codes": ["POL_PERS_002_VIOLATION"],
                    "details": "Hard deny triggered. Prohibited category 'Personal / Gaming'. Execution halted safely with 0 side effects."
                }
            ]
            for a in initial_audits:
                self.col.insert_one(a)

    def list_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        return self.col.find()[:limit]

    def log(self, audit_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.col.insert_one(audit_dict)
        return audit_dict

audit_repo = AuditRepository()

