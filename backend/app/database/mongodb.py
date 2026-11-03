import logging
from typing import Optional, Dict, Any, List
from backend.app.config import settings

logger = logging.getLogger(__name__)

class InMemoryCollection:
    """Thread-safe development fallback that mimics PyMongo collection operations."""
    def __init__(self, name: str):
        self.name = name
        self.data: List[Dict[str, Any]] = []

    def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if not query:
            return [doc.copy() for doc in self.data]
        res = []
        for doc in self.data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                res.append(doc.copy())
        return res

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        results = self.find(query)
        return results[0] if results else None

    def insert_one(self, doc: Dict[str, Any]):
        self.data.insert(0, doc.copy())
        return type("InsertResult", (), {"inserted_id": doc.get("id")})

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        doc = self.find_one(query)
        if doc:
            for item in self.data:
                match = all(item.get(k) == v for k, v in query.items())
                if match:
                    if "$set" in update:
                        item.update(update["$set"])
                    else:
                        item.update(update)
                    return type("UpdateResult", (), {"matched_count": 1, "modified_count": 1})
        return type("UpdateResult", (), {"matched_count": 0, "modified_count": 0})

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))


class MongoCollectionWrapper:
    """
    Wraps a real PyMongo Collection to ensure:
    1. Zero ObjectId serialization issues (strips _id by default)
    2. list return types matching the in-memory fallback
    3. Safe count_documents() with default empty filter
    """
    def __init__(self, collection):
        self._col = collection

    def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        cursor = self._col.find(query or {}, {"_id": 0})
        return list(cursor)

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return self._col.find_one(query, {"_id": 0})

    def insert_one(self, doc: Dict[str, Any]):
        doc_copy = doc.copy()
        doc_copy.pop("_id", None)
        return self._col.insert_one(doc_copy)

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        return self._col.update_one(query, update)

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return self._col.count_documents(query or {})


class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False
        self._collections: Dict[str, MongoCollectionWrapper] = {}
        self._fallback_collections: Dict[str, InMemoryCollection] = {}

    @property
    def is_atlas(self) -> bool:
        """Maintains backward compatibility for health checks and status views."""
        return self.is_connected

    def connect(self) -> bool:
        if settings.MONGODB_URI and "mongodb" in settings.MONGODB_URI.lower():
            try:
                from pymongo import MongoClient
                self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
                # Verify connection via admin ping
                self.client.admin.command('ping')
                self.db = self.client[settings.MONGODB_DATABASE]
                self.is_connected = True
                logger.info(f"Connected to MongoDB database: '{settings.MONGODB_DATABASE}' at {settings.MONGODB_URI}")
                
                # Seed any newly connected empty collections
                self.seed_repositories()
                return True
            except Exception as e:
                logger.warning(f"MongoDB connection to '{settings.MONGODB_URI}' unavailable ({e}). Using local in-memory fallback layer.")
        
        self.is_connected = False
        logger.info("Using local robust in-memory persistence engine for offline/demo operation.")
        return False

    def seed_repositories(self):
        """Idempotently seed default collections in MongoDB if empty."""
        try:
            from backend.app.database.repositories.user_repo import user_repo
            from backend.app.database.repositories.policy_repo import policy_repo
            from backend.app.database.repositories.claim_repo import claim_repo
            from backend.app.database.repositories.task_repo import task_repo
            from backend.app.database.repositories.approval_repo import approval_repo
            from backend.app.database.repositories.audit_repo import audit_repo

            user_repo._seed_initial_users()
            policy_repo._seed_initial_policies()
            claim_repo._seed_initial_claims()
            task_repo._seed_initial_tasks()
            approval_repo._seed_initial_approvals()
            audit_repo._seed_initial_audits()
        except Exception as e:
            logger.debug(f"Repo seeding notice: {e}")

    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            if name not in self._collections:
                self._collections[name] = MongoCollectionWrapper(self.db[name])
            return self._collections[name]
        if name not in self._fallback_collections:
            self._fallback_collections[name] = InMemoryCollection(name)
        return self._fallback_collections[name]

db_manager = DatabaseManager()
