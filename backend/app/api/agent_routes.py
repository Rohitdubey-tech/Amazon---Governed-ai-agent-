from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.schemas.task_schema import TaskCreate, TaskResponse
from backend.app.orchestration.workflow import workflow_orchestrator
from backend.app.database.repositories.task_repo import task_repo
from backend.app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/agents", tags=["AI Agents & Workflow Tasks"])

@router.post("/tasks", response_model=TaskResponse)
def submit_task(payload: TaskCreate, current_user: dict = Depends(get_current_user)):
    task = workflow_orchestrator.execute_task(
        prompt=payload.prompt,
        user=current_user,
        receipt_name=payload.receipt_name or "expense_receipt.pdf",
        amount_hint=payload.amount,
        merchant_hint=payload.merchant,
        category_hint=payload.category
    )
    return task

@router.get("/tasks", response_model=List[TaskResponse])
def list_tasks():
    return task_repo.list_all()

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: str):
    task = task_repo.find_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

