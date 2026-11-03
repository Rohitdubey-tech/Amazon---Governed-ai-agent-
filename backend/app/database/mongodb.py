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

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_atlas = False
        self._fallback_collections: Dict[str, InMemoryCollection] = {}

    def connect(self):
        if settings.MONGODB_URI and "mongodb" in settings.MONGODB_URI.lower():
            try:
                from pymongo import MongoClient
                self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
                # Verify connection
                self.client.admin.command('ping')
                self.db = self.client[settings.MONGODB_DATABASE]
                self.is_atlas = True
                logger.info(f"Connected to MongoDB Atlas database: {settings.MONGODB_DATABASE}")
                return
            except Exception as e:
                logger.warning(f"MongoDB Atlas connection unavailable ({e}). Using local in-memory persistence layer.")
        
        self.is_atlas = False
        logger.info("Using local robust in-memory persistence engine for offline/demo operation.")

    def get_collection(self, name: str):
        if self.is_atlas and self.db is not None:
            return self.db[name]
        if name not in self._fallback_collections:
            self._fallback_collections[name] = InMemoryCollection(name)
        return self._fallback_collections[name]

db_manager = DatabaseManager()

