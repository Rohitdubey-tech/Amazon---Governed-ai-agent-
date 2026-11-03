from typing import List
from fastapi import APIRouter
from backend.app.schemas.audit_schema import AuditLogResponse
from backend.app.database.repositories.audit_repo import audit_repo

router = APIRouter(prefix="/audit-logs", tags=["Security & Provenance Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs():
    return audit_repo.list_all()

