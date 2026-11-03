from typing import List
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.approval_schema import ApprovalResponse, ApprovalActionRequest
from backend.app.database.repositories.approval_repo import approval_repo
from backend.app.database.repositories.claim_repo import claim_repo
from backend.app.database.repositories.task_repo import task_repo
from backend.app.governance.governance_gateway import governance_gateway
from backend.app.tools.claim_executor import claim_executor
from backend.app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/approvals", tags=["Human Approvals Management"])

@router.get("/pending", response_model=List[ApprovalResponse])
def list_pending():
    return approval_repo.list_pending()

@router.get("/history", response_model=List[ApprovalResponse])
def list_all():
    return approval_repo.list_all()

@router.get("/{approval_id}", response_model=ApprovalResponse)
def get_approval(approval_id: str):
    appr = approval_repo.find_by_id(approval_id)
    if not appr:
        raise HTTPException(status_code=404, detail="Approval not found")
    return appr

@router.post("/{approval_id}/approve", response_model=ApprovalResponse)
def approve_action(
    approval_id: str,
    payload: ApprovalActionRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        resolved = governance_gateway.verify_and_consume_approval(
            approval_id=approval_id,
            approver_user=current_user,
            action="APPROVE",
            reason=payload.reason
        )
        # Execute allowlisted tool with idempotency key
        idem_key = resolved.get("proposed_action", {}).get("idempotency_key", f"idem_{resolved['claim_id']}")
        claim_executor.execute_claim_disbursement(resolved["claim_id"], idem_key)
        
        # Update associated Task
        task = task_repo.find_by_id(resolved["task_id"])
        if task:
            task["status"] = "SUCCEEDED"
            for step in task["plan"]:
                if step["agent"] == "Execution Agent":
                    step["status"] = "COMPLETED"
                    step["desc"] = "Manager approval verified with cryptographic hash binding. Allowlisted tool executed."
            task_repo.update_task(resolved["task_id"], task)

        return resolved
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{approval_id}/reject", response_model=ApprovalResponse)
def reject_action(
    approval_id: str,
    payload: ApprovalActionRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        resolved = governance_gateway.verify_and_consume_approval(
            approval_id=approval_id,
            approver_user=current_user,
            action="REJECT",
            reason=payload.reason
        )
        # Update associated Claim & Task
        claim_repo.update_claim(resolved["claim_id"], {
            "status": "BLOCKED",
            "block_reason": f"Manager rejected: {payload.reason}"
        })
        task = task_repo.find_by_id(resolved["task_id"])
        if task:
            task["status"] = "FAILED"
            for step in task["plan"]:
                if step["agent"] == "Execution Agent":
                    step["status"] = "BLOCKED"
                    step["desc"] = f"Action rejected by Manager: {payload.reason}"
            task_repo.update_task(resolved["task_id"], task)

        return resolved
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
