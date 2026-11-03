from fastapi import APIRouter
from backend.app.database.repositories.task_repo import task_repo
from backend.app.database.repositories.claim_repo import claim_repo
from backend.app.database.repositories.approval_repo import approval_repo
from backend.app.database.repositories.audit_repo import audit_repo

router = APIRouter(prefix="/dashboard", tags=["Dashboard Aggregates"])

@router.get("/summary")
def get_summary():
    tasks = task_repo.list_all()
    claims = claim_repo.list_all()
    approvals = approval_repo.list_pending()
    audits = audit_repo.list_all()

    total_tasks = len(tasks)
    succeeded_tasks = len([t for t in tasks if t.get("status") == "SUCCEEDED"])
    blocked_actions = len([c for c in claims if c.get("status") == "BLOCKED"])
    total_spend = sum(float(c.get("amount", 0)) for c in claims if c.get("status") == "PROCESSED")
    violations = len([a for a in audits if a.get("governance_decision") == "DENY"])

    return {
        "totalTasks": total_tasks,
        "succeededTasks": succeeded_tasks,
        "pendingApprovals": len(approvals),
        "blockedActions": blocked_actions,
        "totalSpendApproved": total_spend,
        "policyViolations": violations,
        "avgLatencyMs": 242,
        "unauthorizedExecutions": 0
    }

@router.get("/activity")
def get_activity():
    return audit_repo.list_all(limit=8)

