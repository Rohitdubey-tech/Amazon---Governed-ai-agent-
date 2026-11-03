from typing import Dict, Any, List, Tuple
from backend.app.database.repositories.policy_repo import policy_repo
from backend.app.database.repositories.claim_repo import claim_repo

class PolicyEngine:
    """
    Deterministic Policy Engine.
    Executes in ordinary application code, completely independent of LLMs.
    """
    def evaluate(self, proposed_action: Dict[str, Any]) -> Tuple[str, List[str], List[str]]:
        """
        Evaluates active policies.
        Returns: (verdict: ALLOW | REQUIRE_APPROVAL | DENY, reason_codes: list, violation_details: list)
        """
        active_policies = [p for p in policy_repo.list_all() if p.get("active")]
        
        amount = float(proposed_action.get("amount", 0))
        merchant = str(proposed_action.get("merchant", ""))
        category = str(proposed_action.get("category", ""))
        receipt_id = proposed_action.get("receipt_id")
        receipt_name = proposed_action.get("receipt_name", "")

        reason_codes = []
        violations = []
        requires_approval = False

        # 0. Prompt Injection & Adversarial Text Defense (POL-SEC-05)
        if proposed_action.get("injection_flag") or any(
            term in str(proposed_action.get("receipt_name", "")).lower() or 
            term in str(proposed_action.get("raw_text", "")).lower()
            for term in ["ignore previous", "override policy", "disburse funds to", "jailbreak"]
        ):
            reason_codes.append("POL_SEC_05_PROMPT_INJECTION")
            violations.append("Violation of POL-SEC-05: Adversarial prompt injection or instruction override attempt detected.")
            return "DENY", reason_codes, violations

        # 1. Receipt Mandatory Check (POL-REC-01)
        rec_policy = next((p for p in active_policies if p.get("policy_code") == "POL-REC-01"), None)
        if rec_policy and not receipt_id and not receipt_name:
            reason_codes.append("POL_REC_01_MISSING")
            violations.append("Violation of POL-REC-01: Receipt proof is mandatory.")
            return "DENY", reason_codes, violations

        # 2. Personal Category Prohibition (POL-CAT-02)
        pers_policy = next((p for p in active_policies if p.get("policy_code") == "POL-CAT-02"), None)
        if pers_policy:
            prohibited = pers_policy.get("prohibited_categories") or ["Personal", "Gaming", "Luxury", "Crypto"]
            if any(term.lower() in category.lower() for term in prohibited):
                reason_codes.append("POL_CAT_02_PERSONAL_EXPENSE")
                violations.append(f"Violation of POL-CAT-02: Category '{category}' prohibited by corporate expense policy.")
                return "DENY", reason_codes, violations

        # 3. Duplicate Claim Ban (POL-DUP-04)
        dup_policy = next((p for p in active_policies if p.get("policy_code") == "POL-DUP-04"), None)
        if dup_policy:
            duplicate = claim_repo.find_duplicate(merchant, amount)
            if duplicate and duplicate.get("id") != proposed_action.get("claim_id"):
                reason_codes.append("POL_DUP_04_DUPLICATE_CLAIM")
                violations.append(f"Violation of POL-DUP-04: Duplicate claim detected matching existing processed claim {duplicate.get('id')}.")
                return "DENY", reason_codes, violations

        # 4. Manager Approval Threshold Limit (POL-THR-03)
        thr_policy = next((p for p in active_policies if p.get("policy_code") == "POL-THR-03"), None)
        if thr_policy:
            threshold = float(thr_policy.get("threshold", 5000.0))
            if amount > threshold:
                requires_approval = True
                reason_codes.append("POL_THR_03_THRESHOLD_EXCEEDED")
                violations.append(f"Amount ₹{amount:,.2f} exceeds policy threshold of ₹{threshold:,.2f}; Manager authorization mandated.")

        if requires_approval:
            return "REQUIRE_APPROVAL", reason_codes, violations

        reason_codes.extend(["POL_REC_PASS", "POL_CAT_PASS", "UNDER_THRESHOLD"])
        return "ALLOW", reason_codes, []

policy_engine = PolicyEngine()

