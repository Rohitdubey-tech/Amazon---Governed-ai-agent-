import pytest
from backend.app.orchestration.langgraph_workflow import langgraph_engine
from backend.app.agents.langchain_tools import plan_reimbursement_task, extract_untrusted_receipt, evaluate_claim_governance
from backend.app.database.sqlalchemy_db import init_sql_database, SessionLocal
from backend.app.database.sql_models import UserSQL, PolicySQL, ClaimSQL

def test_langgraph_workflow_execution():
    state_in = {
        "task_id": "tsk_lg_unique_01",
        "claim_id": "clm_lg_unique_01",
        "prompt": "Reimburse metro ticket for 145",
        "user": {"id": "usr_lg_test", "name": "LangGraph Tester", "role": "EMPLOYEE", "email": "lg@agent.corp"},
        "receipt_name": "metro_fare.pdf",
        "amount_hint": 145.0,
        "merchant_hint": "Delhi Metro Rail Corporation",
        "category_hint": "Travel"
    }
    result = langgraph_engine.invoke(state_in)
    assert result["final_verdict"] == "ALLOW"
    assert result["task_status"] == "SUCCEEDED"
    assert result["claim_status"] == "PROCESSED"

def test_langchain_tools():
    # Test plan tool
    plan_res = plan_reimbursement_task.invoke({"prompt": "Claim 4500 for flight"})
    assert plan_res["intent"] == "EXPENSE_REIMBURSEMENT"
    assert plan_res["extracted_amount"] == 4500.0

    # Test receipt extraction tool
    receipt_res = extract_untrusted_receipt.invoke({
        "receipt_name": "indigo_flight.pdf",
        "hint_amount": 4500.0
    })
    assert receipt_res["merchant"] == "IndiGo Airlines"
    assert receipt_res["amount"] == 4500.0

    # Test governance evaluation tool
    gov_res = evaluate_claim_governance.invoke({
        "merchant": "Apple Reseller Test",
        "amount": 14200.0,
        "category": "Hardware & Equipment",
        "user_role": "EMPLOYEE",
        "user_id": "usr_emp_01",
        "task_id": "tsk_apple_test_01",
        "claim_id": "clm_apple_test_01"
    })
    assert gov_res["verdict"] in ["REQUIRE_APPROVAL", "DENY"]

def test_sqlalchemy_integration():
    init_success = init_sql_database()
    assert init_success is True

    db = SessionLocal()
    try:
        users = db.query(UserSQL).all()
        assert isinstance(users, list)
    finally:
        db.close()
