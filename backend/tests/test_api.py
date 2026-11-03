import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def employee_token(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "priya.sharma@shieldcorp.io",
        "password": "password123"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

@pytest.fixture
def manager_token(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "vikram.malhotra@shieldcorp.io",
        "password": "password123"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

@pytest.fixture
def admin_token(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "ananya.sen@shieldcorp.io",
        "password": "password123"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

def test_health_and_readiness(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AgentShield AI"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["ready"] is True

def test_auth_flow(client):
    # 1. Invalid login
    res_bad = client.post("/api/v1/auth/login", json={
        "email": "priya.sharma@shieldcorp.io",
        "password": "wrongpassword"
    })
    assert res_bad.status_code == 401

    # 2. Valid login
    res_good = client.post("/api/v1/auth/login", json={
        "email": "priya.sharma@shieldcorp.io",
        "password": "password123"
    })
    assert res_good.status_code == 200
    token = res_good.json()["access_token"]

    # 3. Protected /me endpoint
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "priya.sharma@shieldcorp.io"

    # 4. Registration of new employee
    res_reg = client.post("/api/v1/auth/register", json={
        "email": "rahul.verma@shieldcorp.io",
        "password": "securepassword",
        "name": "Rahul Verma",
        "department": "Security Operations"
    })
    assert res_reg.status_code == 200
    assert res_reg.json()["user"]["role"] == "EMPLOYEE"

def test_agent_task_execution_and_listing(client, employee_token):
    # Submit workflow task
    payload = {
        "prompt": "Reimburse client dinner team meeting ₹3,400",
        "amount": 3400.0,
        "merchant": "Trishna Seafood Bombay",
        "category": "Meals & Entertainment",
        "receipt_name": "trishna_receipt.pdf"
    }
    res = client.post(
        "/api/v1/agents/tasks",
        json=payload,
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert res.status_code == 200
    task = res.json()
    assert task["status"] == "SUCCEEDED"
    assert task["governance_decision"] == "ALLOW"
    assert len(task["plan"]) == 4

    # List tasks
    res_list = client.get("/api/v1/agents/tasks")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

    # Get single task
    res_get = client.get(f"/api/v1/agents/tasks/{task['id']}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == task["id"]

def test_claims_endpoints_and_idor(client, employee_token, manager_token):
    # Manager can list all claims
    res = client.get("/api/v1/claims", headers={"Authorization": f"Bearer {manager_token}"})
    assert res.status_code == 200
    claims = res.json()
    assert len(claims) >= 1

    # Filter claims
    res_filtered = client.get("/api/v1/claims?status=PROCESSED", headers={"Authorization": f"Bearer {manager_token}"})
    assert res_filtered.status_code == 200
    for c in res_filtered.json():
        assert c["status"] == "PROCESSED"

    # IDOR Test: Sarah Chen (employee) accessing her own claim vs accessing someone else's
    first_claim = claims[0]
    # If employee owns the claim, 200; if not, 403
    emp_res = client.get(f"/api/v1/claims/{first_claim['id']}", headers={"Authorization": f"Bearer {employee_token}"})
    if first_claim["user_id"] == "usr_emp_01":
        assert emp_res.status_code == 200
    else:
        assert emp_res.status_code == 403

    # Manager can always access any claim
    mgr_res = client.get(f"/api/v1/claims/{first_claim['id']}", headers={"Authorization": f"Bearer {manager_token}"})
    assert mgr_res.status_code == 200

def test_human_approval_rbac_and_resolution(client, employee_token, manager_token):
    # 1. Trigger a task requiring manager approval
    payload = {
        "prompt": "Procure testing server cluster ₹18,500",
        "amount": 18500.0,
        "merchant": "HPE Systems",
        "category": "Hardware & Equipment",
        "receipt_name": "hpe_invoice.pdf"
    }
    task_res = client.post(
        "/api/v1/agents/tasks",
        json=payload,
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert task_res.status_code == 200
    task_data = task_res.json()
    assert task_data["status"] == "WAITING_FOR_APPROVAL"
    approval_id = task_data["approval_id"]
    assert approval_id is not None

    # 2. Employee attempting to approve -> MUST FAIL WITH 403 FORBIDDEN (RBAC)
    res_unauth = client.post(
        f"/api/v1/approvals/{approval_id}/approve",
        json={"reason": "Self approving by employee"},
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert res_unauth.status_code == 403

    # 3. Manager approving -> MUST SUCCEED
    res_auth = client.post(
        f"/api/v1/approvals/{approval_id}/approve",
        json={"reason": "Approved for critical infrastructure project"},
        headers={"Authorization": f"Bearer {manager_token}"}
    )
    assert res_auth.status_code == 200
    approved_doc = res_auth.json()
    assert approved_doc["status"] == "APPROVED"
    assert approved_doc["consumed"] is True

def test_policies_rbac(client, employee_token, admin_token):
    res = client.get("/api/v1/policies")
    assert res.status_code == 200
    policies = res.json()
    assert len(policies) >= 4

    target_pol = policies[0]["id"]

    # Non-admin trying to toggle policy -> 403
    res_toggle_emp = client.patch(
        f"/api/v1/policies/{target_pol}/toggle",
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert res_toggle_emp.status_code == 403

    # Admin toggling policy -> 200
    res_toggle_adm = client.patch(
        f"/api/v1/policies/{target_pol}/toggle",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_toggle_adm.status_code == 200

    # Toggle back to restore initial state
    res_restore = client.patch(
        f"/api/v1/policies/{target_pol}/toggle",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_restore.status_code == 200

def test_audit_logs(client):
    res = client.get("/api/v1/audit-logs")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) >= 1
    assert "governance_decision" in logs[0]
    assert "action" in logs[0]

def test_evaluations_and_benchmarks(client):
    # Summary
    res_sum = client.get("/api/v1/evaluations/summary")
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert summary["totalRuns"] == 50
    assert summary["unauthorizedSensitiveExecutions"] == 0
    assert summary["taskCompletionRate"] == 100.0

    # 50 cases
    res_cases = client.get("/api/v1/evaluations/cases")
    assert res_cases.status_code == 200
    cases = res_cases.json()
    assert len(cases) == 50

def test_dashboard_stats(client):
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    stats = res.json()
    assert "totalTasks" in stats
    assert "succeededTasks" in stats
    assert "unauthorizedExecutions" in stats
    assert stats["unauthorizedExecutions"] == 0
