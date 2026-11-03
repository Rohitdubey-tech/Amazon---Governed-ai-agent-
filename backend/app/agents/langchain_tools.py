"""
LangChain Tools and Structured Components for AgentShield AI.
Wraps core governance and multi-agent capabilities as standard LangChain tools.
"""
from typing import Dict, Any, Optional
from langchain_core.tools import tool
from backend.app.services.llm_provider import llm_provider
from backend.app.governance.governance_gateway import governance_gateway
from backend.app.tools.claim_executor import claim_executor

@tool
def plan_reimbursement_task(prompt: str) -> Dict[str, Any]:
    """LangChain Tool: Decomposes natural language expense claim prompt into execution subtasks and checks for prompt injection."""
    return llm_provider.plan_decomposition(prompt)

@tool
def extract_untrusted_receipt(
    receipt_name: str,
    hint_amount: Optional[float] = None,
    hint_merchant: Optional[str] = None,
    raw_text: str = ""
) -> Dict[str, Any]:
    """LangChain Tool: Ingests untrusted receipt documents, scans for prompt injection, and extracts structured invoice metadata."""
    return llm_provider.extract_receipt_data(
        receipt_text=raw_text,
        file_name=receipt_name,
        hint_amount=hint_amount,
        hint_merchant=hint_merchant
    )

@tool
def evaluate_claim_governance(
    merchant: str,
    amount: float,
    category: str,
    user_role: str,
    user_id: str,
    task_id: str,
    claim_id: str,
    injection_flag: bool = False
) -> Dict[str, Any]:
    """LangChain Tool: Submits proposed execution action to the independent fail-closed Governance Gateway."""
    proposed_action = {
        "operation": "SUBMIT_EXPENSE_CLAIM",
        "merchant": merchant,
        "amount": amount,
        "currency": "INR",
        "category": category,
        "task_id": task_id,
        "claim_id": claim_id,
        "requester_id": user_id,
        "injection_flag": injection_flag
    }
    mock_user = {"id": user_id, "role": user_role, "name": "LangChain Agent"}
    return governance_gateway.evaluate_proposal(
        proposed_action=proposed_action,
        user=mock_user,
        agent_name="LangChainGovernanceAgent"
    )
