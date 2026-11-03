import uuid
import re
from typing import Dict, Any, List
from backend.app.tools.receipt_reader import receipt_reader
from backend.app.tools.claim_executor import claim_executor
from backend.app.governance.governance_gateway import governance_gateway
from backend.app.database.repositories.claim_repo import claim_repo
from backend.app.database.repositories.task_repo import task_repo
from backend.app.services.llm_provider import llm_provider

class PlannerAgent:
    """Decomposes user natural-language prompt into typed execution subtasks."""
    def run(self, prompt: str, user: Dict[str, Any]) -> Dict[str, Any]:
        return llm_provider.plan_decomposition(prompt)

class ReceiptAgent:
    """Controlled OCR and extraction agent treating documents as untrusted."""
    def run(self, receipt_name: str, hint_amount: float = None, hint_merchant: str = None, raw_text: str = "") -> Dict[str, Any]:
        return llm_provider.extract_receipt_data(
            receipt_text=raw_text,
            file_name=receipt_name,
            hint_amount=hint_amount,
            hint_merchant=hint_merchant
        )

class ValidationAgent:
    """Verifies data types, completeness, and consistency."""
    def run(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        has_amount = bool(extracted_data.get("amount"))
        has_merchant = bool(extracted_data.get("merchant"))
        injection_flag = extracted_data.get("injection_flag", False)
        valid = has_amount and has_merchant and not injection_flag
        
        findings = []
        if valid:
            findings.append("Mandatory merchant and amount present")
        if injection_flag:
            findings.append("Security Alert: Prompt injection pattern detected in receipt")
        if not has_amount or not has_merchant:
            findings.append("Missing required fields")

        return {
            "valid": valid,
            "confidence": extracted_data.get("confidence", 0.9),
            "findings": findings
        }

class ExecutionAgent:
    """Prepares proposed action and mediates gateway authorization."""
    def run(self, task_id: str, claim_id: str, extracted_data: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
        idempotency_key = f"idem_{task_id}_{uuid.uuid4().hex[:6]}"
        
        proposed_action = {
            "operation": "SUBMIT_EXPENSE_CLAIM",
            "amount": extracted_data.get("amount", 0.0),
            "currency": extracted_data.get("currency", "INR"),
            "merchant": extracted_data.get("merchant", "Unknown"),
            "category": extracted_data.get("category", "General"),
            "receipt_id": f"rcpt_{uuid.uuid4().hex[:6]}",
            "receipt_name": extracted_data.get("receipt_name", "receipt.pdf"),
            "task_id": task_id,
            "claim_id": claim_id,
            "requester_id": user.get("id"),
            "idempotency_key": idempotency_key,
            "injection_flag": extracted_data.get("injection_flag", False),
            "raw_text": extracted_data.get("raw_text_snippet", "")
        }

        # Mediate through independent Governance Gateway!
        decision_result = governance_gateway.evaluate_proposal(
            proposed_action=proposed_action,
            user=user,
            agent_name="ExecutionAgent"
        )

        verdict = decision_result["verdict"]

        # Only on ALLOW can the allowlisted tool execute!
        if verdict == "ALLOW":
            claim_executor.execute_claim_disbursement(claim_id, idempotency_key)

        return {
            "proposed_action": proposed_action,
            "decision": decision_result
        }

planner_agent = PlannerAgent()
receipt_agent = ReceiptAgent()
validation_agent = ValidationAgent()
execution_agent = ExecutionAgent()

