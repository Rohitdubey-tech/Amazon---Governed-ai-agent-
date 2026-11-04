from datetime import datetime, timezone
from typing import Dict, Any
from backend.app.database.repositories.claim_repo import claim_repo

class ClaimExecutorTool:
    """
    Allowlisted Controlled Tool.
    Executes simulated claim submission with idempotency token ONLY when authorized by Governance Gateway.
    """
    def execute_claim_disbursement(self, claim_id: str, idempotency_key: str) -> Dict[str, Any]:
        claim = claim_repo.find_by_id(claim_id)
        if not claim:
            raise ValueError(f"Claim {claim_id} not found.")

        # Replay safety: if already processed with this exact key, return existing execution safely
        if claim.get("status") == "PROCESSED" and claim.get("idempotency_key") == idempotency_key:
            return {
                "success": True,
                "claim_id": claim_id,
                "status": "PROCESSED",
                "executed_at": claim.get("executed_at"),
                "idempotency_key": idempotency_key,
                "replayed": True
            }

        now_iso = datetime.now(timezone.utc).isoformat()
        claim_repo.update_claim(claim_id, {
            "status": "PROCESSED",
            "executed_at": now_iso,
            "idempotency_key": idempotency_key
        })
        return {
            "success": True,
            "claim_id": claim_id,
            "status": "PROCESSED",
            "executed_at": now_iso,
            "idempotency_key": idempotency_key
        }

claim_executor = ClaimExecutorTool()
