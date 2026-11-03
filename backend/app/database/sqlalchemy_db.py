"""
SQLAlchemy Database Engine and Session Management for AgentShield AI.
Provides relational ORM support (SQLite / PostgreSQL) alongside MongoDB.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database.sql_models import Base

# Default to SQLite for zero-configuration relational persistence, or override via SQLALCHEMY_DATABASE_URI
DEFAULT_SQLITE_URL = "sqlite:///./agentshield_ai.db"
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", DEFAULT_SQLITE_URL)

engine = create_engine(
    SQLALCHEMY_DATABASE_URI,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_sql_database():
    """Create all relational tables defined in sql_models."""
    try:
        Base.metadata.create_all(bind=engine)
        return True
    except Exception as exc:
        print(f"[SQLAlchemy] Database initialization warning: {exc}")
        return False

def get_sql_db():
    """Dependency helper for FastAPI endpoints requiring a relational session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
