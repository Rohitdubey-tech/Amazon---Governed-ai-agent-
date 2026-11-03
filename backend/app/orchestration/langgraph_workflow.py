"""
LangGraph Multi-Agent Governance Workflow for AgentShield AI.
Uses LangGraph StateGraph to orchestrate:
1. Planner Node (LangChain & Gemini decomposition)
2. OCR / Multimodal Node (Untrusted document ingestion)
3. Validation Node (Pydantic schema & prompt injection check)
4. Governance Gateway Node (Policy engine + Risk assessment + HITL fail-closed boundary)
"""
import uuid
from datetime import datetime, timezone
from typing import TypedDict, Dict, Any, List, Optional
from langgraph.graph import StateGraph, START, END

from backend.app.agents.specialist_agents import planner_agent, receipt_agent, validation_agent, execution_agent
from backend.app.database.repositories.task_repo import task_repo
from backend.app.database.repositories.claim_repo import claim_repo

class AgentShieldState(TypedDict, total=False):
    task_id: str
    claim_id: str
    user: Dict[str, Any]
    prompt: str
    receipt_name: str
    amount_hint: Optional[float]
    merchant_hint: Optional[str]
    category_hint: Optional[str]
    plan_data: Dict[str, Any]
    extracted_data: Dict[str, Any]
    validation_data: Dict[str, Any]
    decision_data: Dict[str, Any]
    steps: List[Dict[str, Any]]
    final_verdict: str
    task_status: str
    claim_status: str

def planner_node(state: AgentShieldState) -> Dict[str, Any]:
    prompt = state.get("prompt", "")
    user = state.get("user", {})
    plan_out = planner_agent.run(prompt, user)
    return {"plan_data": plan_out}

def ocr_node(state: AgentShieldState) -> Dict[str, Any]:
    receipt_name = state.get("receipt_name", "receipt.pdf")
    plan_out = state.get("plan_data", {})
    hint_amount = state.get("amount_hint") or plan_out.get("extracted_amount")
    hint_merchant = state.get("merchant_hint")

    extracted = receipt_agent.run(
        receipt_name=receipt_name,
        hint_amount=hint_amount,
        hint_merchant=hint_merchant
    )
    extracted["receipt_name"] = receipt_name
    if state.get("category_hint"):
        extracted["category"] = state.get("category_hint")

    return {"extracted_data": extracted}

def validation_node(state: AgentShieldState) -> Dict[str, Any]:
    extracted = state.get("extracted_data", {})
    val_out = validation_agent.run(extracted)
    return {"validation_data": val_out}

def governance_gateway_node(state: AgentShieldState) -> Dict[str, Any]:
    task_id = state.get("task_id") or f"tsk_{uuid.uuid4().hex[:6]}"
    claim_id = state.get("claim_id") or f"clm_{uuid.uuid4().hex[:6]}"
    user = state.get("user", {})
    extracted = state.get("extracted_data", {})
    receipt_name = state.get("receipt_name", "receipt.pdf")
    now_iso = datetime.now(timezone.utc).isoformat()

    # Create draft claim record before executing gateway check
    initial_claim = {
        "id": claim_id,
        "task_id": task_id,
        "user_id": user.get("id"),
        "user_name": user.get("name"),
        "user_email": user.get("email"),
        "merchant": extracted.get("merchant", "Unknown"),
        "amount": extracted.get("amount", 0.0),
        "currency": extracted.get("currency", "INR"),
        "category": extracted.get("category", "General"),
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "receipt_id": f"rcpt_{uuid.uuid4().hex[:6]}",
        "receipt_name": receipt_name,
        "status": "DRAFT",
        "governance_decision": "PENDING",
        "approval_id": None,
        "risk_score": 15,
        "risk_level": "LOW",
        "block_reason": None,
        "action_hash": None,
        "created_at": now_iso,
        "executed_at": None
    }
    claim_repo.create(initial_claim)

    exec_out = execution_agent.run(
        task_id=task_id,
        claim_id=claim_id,
        extracted_data=extracted,
        user=user
    )

    decision_data = exec_out["decision"]
    verdict = decision_data["verdict"]

    if verdict == "ALLOW":
        task_status = "SUCCEEDED"
        claim_status = "PROCESSED"
    elif verdict == "REQUIRE_APPROVAL":
        task_status = "WAITING_FOR_APPROVAL"
        claim_status = "WAITING_FOR_APPROVAL"
    else:
        task_status = "FAILED"
        claim_status = "BLOCKED"

    # Update claim in repo
    claim_repo.update_claim(claim_id, {
        "status": claim_status,
        "governance_decision": verdict,
        "approval_id": decision_data.get("approval_id"),
        "risk_score": decision_data.get("risk_score", 0),
        "risk_level": decision_data.get("risk_level", "LOW"),
        "block_reason": decision_data.get("violations", [None])[0] if decision_data.get("violations") else None,
        "action_hash": decision_data.get("action_hash"),
        "executed_at": now_iso if verdict == "ALLOW" else None
    })

    return {
        "task_id": task_id,
        "claim_id": claim_id,
        "decision_data": decision_data,
        "final_verdict": verdict,
        "task_status": task_status,
        "claim_status": claim_status
    }

def build_langgraph_workflow() -> Any:
    graph_builder = StateGraph(AgentShieldState)

    graph_builder.add_node("planner_node", planner_node)
    graph_builder.add_node("ocr_node", ocr_node)
    graph_builder.add_node("validation_node", validation_node)
    graph_builder.add_node("governance_gateway_node", governance_gateway_node)

    graph_builder.add_edge(START, "planner_node")
    graph_builder.add_edge("planner_node", "ocr_node")
    graph_builder.add_edge("ocr_node", "validation_node")
    graph_builder.add_edge("validation_node", "governance_gateway_node")
    graph_builder.add_edge("governance_gateway_node", END)

    return graph_builder.compile()

langgraph_engine = build_langgraph_workflow()
