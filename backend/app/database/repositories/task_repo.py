from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from backend.app.database.mongodb import db_manager

class TaskRepository:
    def __init__(self):
        self._seed_initial_tasks()

    @property
    def col(self):
        return db_manager.get_collection("agent_tasks")

    def _seed_initial_tasks(self):
        if self.col.count_documents() == 0:
            now = datetime.now(timezone.utc).isoformat()
            initial_tasks = [
                {
                    "id": "tsk_7721",
                    "user_id": "usr_emp_01",
                    "user_name": "Priya Sharma",
                    "prompt": "Process my ₹4,500 business travel expense from New Delhi to Bengaluru.",
                    "receipt_name": "indigo_flight_del_blr.pdf",
                    "status": "SUCCEEDED",
                    "plan": [
                        {"step": 1, "agent": "Planner Agent", "desc": "Decompose travel expense task and create structured execution schema", "status": "COMPLETED"},
                        {"step": 2, "agent": "Receipt Agent", "desc": "OCR receipt extraction: Indigo Airlines, ₹4,500 INR, Date: 2026-11-01", "status": "COMPLETED"},
                        {"step": 3, "agent": "Validation Agent", "desc": "Verify receipt validity, policy fields, and run duplicate check", "status": "COMPLETED"},
                        {"step": 4, "agent": "Execution Agent", "desc": "Prepare proposed action & request independent Governance Gateway approval", "status": "COMPLETED"}
                    ],
                    "governance_decision": "ALLOW",
                    "claim_id": "clm_8941",
                    "approval_id": None,
                    "action_hash": "a1b2c3d4e5f60102030405060708090a1b2c3d4e5f60102030405060708090a1",
                    "risk_score": 18,
                    "risk_level": "LOW",
                    "risk_factors": ["Standard business travel under threshold limit"],
                    "created_at": now,
                    "completed_at": now
                }
            ]
            for t in initial_tasks:
                self.col.insert_one(t)

    def list_all(self) -> List[Dict[str, Any]]:
        return self.col.find()

    def find_by_id(self, task_id: str) -> Optional[Dict[str, Any]]:
        return self.col.find_one({"id": task_id})

    def create(self, task_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.col.insert_one(task_dict)
        return task_dict

    def update_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        self.col.update_one({"id": task_id}, {"$set": updates})
        return self.find_by_id(task_id)

task_repo = TaskRepository()

