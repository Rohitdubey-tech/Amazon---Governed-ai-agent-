import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from backend.app.governance.policy_engine import policy_engine
from backend.app.governance.risk_engine import risk_engine
from backend.app.governance.crypto_utils import compute_action_hash
from backend.app.database.repositories.approval_repo import approval_repo
from backend.app.database.repositories.audit_repo import audit_repo

class GovernanceGateway:
    """
    Independent Governance Gateway.
    The single non-negotiable trust boundary mediating privileged tool operations.
    """
    def evaluate_proposal(
        self,
        proposed_action: Dict[str, Any],
        user: Dict[str, Any],
        agent_name: str = "ExecutionAgent"
    ) -> Dict[str, Any]:
        correlation_id = f"corr_{uuid.uuid4().hex[:10]}"
        action_hash = compute_action_hash(proposed_action)

        # 1. Deterministic Policy Evaluation
        verdict, reason_codes, violations = policy_engine.evaluate(proposed_action)

        # 2. Risk Engine Evaluation
        risk_score, risk_level, risk_factors = risk_engine.calculate_risk(proposed_action, verdict, violations)

        approval_id = None
        now = datetime.now(timezone.utc)

        # 3. Handle REQUIRE_APPROVAL: Pause workflow and bind approval to action hash
        if verdict == "REQUIRE_APPROVAL":
            approval_id = f"appr_{uuid.uuid4().hex[:8]}"
            approval_doc = {
                "id": approval_id,
                "task_id": proposed_action.get("task_id", ""),
                "claim_id": proposed_action.get("claim_id", ""),
                "requester_id": user.get("id"),
                "requester_name": user.get("name"),
                "requester_email": user.get("email"),
                "proposed_action": proposed_action,
                "action_hash": action_hash,
                "trigger_rule": violations[0] if violations else "Policy threshold exceeded",
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "status": "PENDING",
                "created_at": now.isoformat(),
                "expires_at": (now + timedelta(days=3)).isoformat(),
                "consumed": False,
                "approver_id": None,
                "approver_name": None,
                "approval_reason": None,
                "rejection_reason": None,
                "resolved_at": None
            }
            approval_repo.create(approval_doc)

        # 4. Write immutable security audit event
        audit_repo.log({
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "correlation_id": correlation_id,
            "timestamp": now.isoformat(),
            "actor": f"agent:{agent_name}",
            "actor_type": "AGENT",
            "action": "EVALUATE_GOVERNANCE_GATEWAY",
            "resource": f"operation:{proposed_action.get('operation', 'UNKNOWN')}",
            "governance_decision": verdict,
            "reason_codes": reason_codes,
            "details": f"Gateway evaluated proposal for ₹{proposed_action.get('amount', 0)}. Verdict: {verdict}. Hash: {action_hash[:16]}..."
        })

        return {
            "verdict": verdict,
            "action_hash": action_hash,
            "reason_codes": reason_codes,
            "violations": violations,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "approval_id": approval_id,
            "correlation_id": correlation_id
        }

    def verify_and_consume_approval(
        self,
        approval_id: str,
        approver_user: Dict[str, Any],
        action: str = "APPROVE",
        reason: str = "Manager approval granted"
    ) -> Dict[str, Any]:
        """
        Validates manager permissions and verifies exact-action hash binding before resumption.
        """
        # RBAC Check: Employee cannot approve!
        if approver_user.get("role") not in ("MANAGER", "ADMIN"):
            raise PermissionError("PERMISSION_DENIED: Manager or Admin authorization required.")

        approval = approval_repo.find_by_id(approval_id)
        if not approval:
            raise ValueError("Approval record not found.")

        if approval.get("status") != "PENDING" or approval.get("consumed"):
            raise ValueError("Approval token has already been consumed or resolved.")

        # Re-compute action hash to guarantee exact-action integrity
        recomputed_hash = compute_action_hash(approval.get("proposed_action", {}))
        if recomputed_hash != approval.get("action_hash"):
            approval_repo.update_approval(approval_id, {"status": "INVALIDATED", "consumed": True})
            raise ValueError("SECURITY_VIOLATION: Action payload modified in-flight. Approval invalidated.")

        now_iso = datetime.now(timezone.utc).isoformat()
        if action == "APPROVE":
            approval_repo.update_approval(approval_id, {
                "status": "APPROVED",
                "consumed": True,
                "approver_id": approver_user.get("id"),
                "approver_name": approver_user.get("name"),
                "approval_reason": reason,
                "resolved_at": now_iso
            })
            verdict = "ALLOW"
        else:
            approval_repo.update_approval(approval_id, {
                "status": "REJECTED",
                "consumed": True,
                "approver_id": approver_user.get("id"),
                "approver_name": approver_user.get("name"),
                "rejection_reason": reason,
                "resolved_at": now_iso
            })
            verdict = "DENY"

        audit_repo.log({
            "id": f"aud_{uuid.uuid4().hex[:8]}",
            "correlation_id": f"corr_{uuid.uuid4().hex[:10]}",
            "timestamp": now_iso,
            "actor": f"user:{approver_user.get('email')}",
            "actor_type": f"USER_{approver_user.get('role')}",
            "action": f"{action}_PENDING_APPROVAL",
            "resource": f"approval:{approval_id}",
            "governance_decision": verdict,
            "reason_codes": [f"MANAGER_{action}D", "ACTION_HASH_VERIFIED"],
            "details": f"Manager {approver_user.get('name')} {action.lower()}d approval {approval_id} for claim {approval.get('claim_id')}."
        })

        return approval_repo.find_by_id(approval_id)

governance_gateway = GovernanceGateway()

