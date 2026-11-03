import pytest
from backend.app.orchestration.workflow import workflow_orchestrator
from backend.app.database.repositories.claim_repo import claim_repo
from backend.app.database.repositories.task_repo import task_repo
from backend.app.database.repositories.approval_repo import approval_repo
from backend.app.governance.governance_gateway import governance_gateway

def test_workflow_scenario_a_auto_approved():
    """Scenario A: Standard valid claim under threshold is auto-approved and executed."""
    user = {"id": "usr_emp_01", "name": "Sarah Chen", "email": "sarah.chen@acme.corp", "role": "EMPLOYEE"}
    prompt = "Submit reimbursement for local client visit Uber for Business ₹1,850"
    
    result = workflow_orchestrator.execute_task(
        prompt=prompt,
        user=user,
        receipt_name="uber_trip_receipt.pdf",
        amount_hint=1850.0,
        merchant_hint="Uber for Business",
        category_hint="Travel"
    )

    assert result["status"] == "SUCCEEDED"
    assert result["governance_decision"] == "ALLOW"
    assert len(result["plan"]) == 4
    
    # Check execution step
    step_exec = result["plan"][3]
    assert step_exec["status"] == "COMPLETED"
    
    # Check claim record
    claim = claim_repo.find_by_id(result["claim_id"])
    assert claim["status"] == "PROCESSED"
    assert claim["amount"] == 1850.0

def test_workflow_duplicate_claim_denial():
    """Scenario Duplicate: Submitting claim identical to existing processed claim is DENIED by POL-DUP-04."""
    user = {"id": "usr_emp_01", "name": "Sarah Chen", "email": "sarah.chen@acme.corp", "role": "EMPLOYEE"}
    # IndiGo Airlines 4500.0 is already seeded as processed
    prompt = "Submit IndiGo Airlines ticket ₹4,500 again"
    result = workflow_orchestrator.execute_task(
        prompt=prompt,
        user=user,
        receipt_name="indigo_flight_del_blr.pdf",
        amount_hint=4500.0,
        merchant_hint="IndiGo Airlines",
        category_hint="Travel"
    )
    assert result["status"] == "FAILED"
    assert result["governance_decision"] == "DENY"
    claim = claim_repo.find_by_id(result["claim_id"])
    assert "POL-DUP-04" in claim["block_reason"]

def test_workflow_scenario_b_threshold_pause():
    """Scenario B: Valid claim exceeding ₹5,000 pauses for manager approval."""
    user = {"id": "usr_emp_01", "name": "Sarah Chen", "email": "sarah.chen@acme.corp", "role": "EMPLOYEE"}
    prompt = "Purchase monitor and docking station Apple ₹14,200 for engineering workspace"
    
    result = workflow_orchestrator.execute_task(
        prompt=prompt,
        user=user,
        receipt_name="apple_invoice.pdf",
        amount_hint=14200.0,
        merchant_hint="Apple Authorized Reseller",
        category_hint="Hardware"
    )

    assert result["status"] == "WAITING_FOR_APPROVAL"
    assert result["governance_decision"] == "REQUIRE_APPROVAL"
    assert result["approval_id"] is not None
    assert result["action_hash"] is not None

    # Claim should be waiting for approval, not disbursed
    claim = claim_repo.find_by_id(result["claim_id"])
    assert claim["status"] == "WAITING_FOR_APPROVAL"

    # Approval record should exist and be PENDING
    approval = approval_repo.find_by_id(result["approval_id"])
    assert approval is not None
    assert approval["status"] == "PENDING"
    assert approval["action_hash"] == result["action_hash"]

def test_workflow_scenario_c_policy_denial():
    """Scenario C: Prohibited personal expense (e.g. Gaming) is denied immediately by Governance Gateway."""
    user = {"id": "usr_emp_01", "name": "Sarah Chen", "email": "sarah.chen@acme.corp", "role": "EMPLOYEE"}
    prompt = "Claim reimbursement for PlayStation Network game purchase ₹3,999"
    
    result = workflow_orchestrator.execute_task(
        prompt=prompt,
        user=user,
        receipt_name="psn_store_receipt.pdf",
        amount_hint=3999.0,
        merchant_hint="PlayStation Network Store",
        category_hint="Gaming"
    )

    assert result["status"] == "FAILED"
    assert result["governance_decision"] == "DENY"
    
    # Check step 4 was blocked
    step_exec = result["plan"][3]
    assert step_exec["status"] == "BLOCKED"

    # Claim should be BLOCKED
    claim = claim_repo.find_by_id(result["claim_id"])
    assert claim["status"] == "BLOCKED"
    assert "POL-CAT-02" in claim["block_reason"] or "prohibited" in claim["block_reason"]
