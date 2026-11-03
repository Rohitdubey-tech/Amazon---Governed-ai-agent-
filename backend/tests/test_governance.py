import pytest
from backend.app.governance.crypto_utils import canonicalize, compute_action_hash
from backend.app.governance.policy_engine import policy_engine
from backend.app.governance.risk_engine import risk_engine
from backend.app.governance.governance_gateway import governance_gateway
from backend.app.database.repositories.approval_repo import approval_repo

def test_canonical_action_hash_determinism():
    """Verify that action hash computation is strictly deterministic and invariant to dictionary ordering."""
    payload_a = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 3200.0,
        "merchant": "AWS Cloud Services",
        "category": "Cloud Infrastructure",
        "user_id": "usr_001",
        "idempotency_key": "idem_12345"
    }
    payload_b = {
        "idempotency_key": "idem_12345",
        "user_id": "usr_001",
        "category": "Cloud Infrastructure",
        "merchant": "AWS Cloud Services",
        "amount": 3200.0,
        "operation": "CREATE_EXPENSE_CLAIM"
    }
    hash_a = compute_action_hash(payload_a)
    hash_b = compute_action_hash(payload_b)
    
    assert hash_a == hash_b
    assert len(hash_a) == 64

def test_action_hash_sensitivity():
    """Verify that any tampering with payload parameters alters the SHA-256 hash."""
    payload = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 3200.0,
        "merchant": "AWS Cloud Services",
        "category": "Cloud Infrastructure"
    }
    tampered_payload = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 3200.01,
        "merchant": "AWS Cloud Services",
        "category": "Cloud Infrastructure"
    }
    assert compute_action_hash(payload) != compute_action_hash(tampered_payload)

def test_policy_allow_standard_claim():
    """Verify standard legitimate business claim under threshold returns ALLOW."""
    action = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 3200.0,
        "merchant": "AWS Cloud Services",
        "category": "Cloud Infrastructure",
        "receipt_id": "rec_aws_01",
        "receipt_name": "aws_receipt.pdf"
    }
    verdict, reasons, violations = policy_engine.evaluate(action)
    assert verdict == "ALLOW"
    assert len(violations) == 0

def test_policy_require_approval_over_threshold():
    """Verify claim exceeding threshold (> ₹5,000) mandates manager approval."""
    action = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 14500.0,
        "merchant": "Dell Technologies",
        "category": "Hardware & Equipment",
        "receipt_id": "rec_dell_01",
        "receipt_name": "dell_invoice.pdf"
    }
    verdict, reasons, violations = policy_engine.evaluate(action)
    assert verdict == "REQUIRE_APPROVAL"
    assert "POL_THR_03_THRESHOLD_EXCEEDED" in reasons
    assert any("₹5,000" in v or "threshold" in v for v in violations)

def test_policy_deny_missing_receipt():
    """Verify claim missing mandatory receipt proof is immediately DENIED (POL-REC-01)."""
    action = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 2500.0,
        "merchant": "Uber Business",
        "category": "Travel",
        "receipt_id": None,
        "receipt_name": ""
    }
    verdict, reasons, violations = policy_engine.evaluate(action)
    assert verdict == "DENY"
    assert "POL_REC_01_MISSING" in reasons

def test_policy_deny_prohibited_category():
    """Verify claim in prohibited personal categories is DENIED (POL-CAT-02)."""
    action = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 1200.0,
        "merchant": "Steam Gaming",
        "category": "Gaming",
        "receipt_id": "rec_steam_01",
        "receipt_name": "steam.pdf"
    }
    verdict, reasons, violations = policy_engine.evaluate(action)
    assert verdict == "DENY"
    assert "POL_CAT_02_PERSONAL_EXPENSE" in reasons

def test_risk_engine_scoring():
    """Verify risk engine properly scores low, threshold, and denied actions."""
    score_low, level_low, _ = risk_engine.calculate_risk(
        {"amount": 2000.0, "category": "Office Supplies"}, "ALLOW", []
    )
    assert level_low == "LOW"
    assert score_low < 35

    score_high, level_high, _ = risk_engine.calculate_risk(
        {"amount": 14500.0, "category": "Hardware"}, "REQUIRE_APPROVAL", []
    )
    assert level_high in ("MEDIUM", "HIGH")
    assert score_high >= 35

    score_deny, level_deny, _ = risk_engine.calculate_risk(
        {"amount": 500.0, "category": "Gaming"}, "DENY", ["Category prohibited"]
    )
    assert level_deny == "HIGH"
    assert score_deny > 80

def test_governance_gateway_lifecycle_and_tamper_defense():
    """Verify GovernanceGateway approval creation, RBAC authorization, and anti-tamper hash defense."""
    user = {"id": "usr_emp_01", "name": "Sarah Chen", "email": "sarah.chen@acme.corp", "role": "EMPLOYEE"}
    manager = {"id": "usr_mgr_01", "name": "Daniel Craig", "email": "daniel.craig@acme.corp", "role": "MANAGER"}
    
    proposed_action = {
        "operation": "CREATE_EXPENSE_CLAIM",
        "amount": 14500.0,
        "merchant": "Dell Technologies",
        "category": "Hardware",
        "receipt_id": "rec_001",
        "receipt_name": "receipt.pdf"
    }
    
    # 1. Gateway evaluates proposal
    eval_result = governance_gateway.evaluate_proposal(proposed_action, user)
    assert eval_result["verdict"] == "REQUIRE_APPROVAL"
    approval_id = eval_result["approval_id"]
    assert approval_id is not None
    
    # 2. RBAC check: Employee cannot approve!
    with pytest.raises(PermissionError):
        governance_gateway.verify_and_consume_approval(approval_id, user, action="APPROVE")
        
    # 3. Tampering check: If payload is altered in database, hash mismatch must fail closed
    approval_doc = approval_repo.find_by_id(approval_id)
    approval_doc["proposed_action"]["amount"] = 145000.0 # tampered 10x!
    approval_repo.update_approval(approval_id, {"proposed_action": approval_doc["proposed_action"]})
    
    with pytest.raises(ValueError, match="SECURITY_VIOLATION"):
        governance_gateway.verify_and_consume_approval(approval_id, manager, action="APPROVE")
        
    # Check that tampered approval is invalidated
    invalidated_doc = approval_repo.find_by_id(approval_id)
    assert invalidated_doc["status"] == "INVALIDATED"
    assert invalidated_doc["consumed"] is True

