import bcrypt
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from backend.app.database.mongodb import db_manager

class UserRepository:
    def __init__(self):
        self._seed_initial_users()

    @property
    def col(self):
        return db_manager.get_collection("users")

    def _seed_initial_users(self):
        if self.col.count_documents() == 0:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw("password123".encode("utf-8"), salt).decode("utf-8")
            now = datetime.now(timezone.utc).isoformat()
            
            initial_users = [
                {
                    "id": "usr_emp_01",
                    "email": "priya.sharma@shieldcorp.io",
                    "password_hash": hashed,
                    "name": "Priya Sharma",
                    "role": "EMPLOYEE",
                    "department": "Engineering",
                    "status": "ACTIVE",
                    "created_at": now
                },
                {
                    "id": "usr_mgr_01",
                    "email": "vikram.malhotra@shieldcorp.io",
                    "password_hash": hashed,
                    "name": "Vikram Malhotra",
                    "role": "MANAGER",
                    "department": "Engineering Leadership",
                    "status": "ACTIVE",
                    "created_at": now
                },
                {
                    "id": "usr_adm_01",
                    "email": "ananya.sen@shieldcorp.io",
                    "password_hash": hashed,
                    "name": "Ananya Sen",
                    "role": "ADMIN",
                    "department": "InfoSec & Governance",
                    "status": "ACTIVE",
                    "created_at": now
                }
            ]
            for u in initial_users:
                self.col.insert_one(u)

    def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self.col.find_one({"email": email.lower().strip()})

    def find_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.col.find_one({"id": user_id})

    def list_all(self) -> List[Dict[str, Any]]:
        return self.col.find()

    def create(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.col.insert_one(user_dict)
        return user_dict

user_repo = UserRepository()

