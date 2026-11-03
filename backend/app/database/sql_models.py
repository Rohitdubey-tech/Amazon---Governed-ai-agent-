"""
SQLAlchemy ORM Data Models for AgentShield AI.
Provides relational persistence and enterprise SQL schema support alongside MongoDB.
"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class UserSQL(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="EMPLOYEE")  # ADMIN, MANAGER, EMPLOYEE
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class PolicySQL(Base):
    __tablename__ = "policies"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    max_amount = Column(Float, nullable=False, default=5000.0)
    requires_approval_above = Column(Float, nullable=False, default=2000.0)
    allowed_roles = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

class ClaimSQL(Base):
    __tablename__ = "expense_claims"

    id = Column(String(64), primary_key=True)
    task_id = Column(String(64), nullable=True, index=True)
    user_id = Column(String(64), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    merchant = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    category = Column(String(100), default="General")
    date = Column(String(50), nullable=False)
    receipt_id = Column(String(64), nullable=True)
    receipt_name = Column(String(255), nullable=True)
    status = Column(String(50), default="DRAFT")  # DRAFT, WAITING_FOR_APPROVAL, PROCESSED, BLOCKED
    governance_decision = Column(String(50), default="PENDING")  # ALLOW, REQUIRE_APPROVAL, DENY
    approval_id = Column(String(64), nullable=True)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String(20), default="LOW")
    block_reason = Column(Text, nullable=True)
    action_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    executed_at = Column(DateTime(timezone=True), nullable=True)

class ApprovalSQL(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True)
    claim_id = Column(String(64), nullable=False, index=True)
    task_id = Column(String(64), nullable=True)
    requester_name = Column(String(255), nullable=False)
    merchant = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String(20), default="MEDIUM")
    action_hash = Column(String(64), nullable=False)
    decision = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED
    reviewed_by = Column(String(255), nullable=True)
    reviewer_role = Column(String(50), nullable=True)
    justification = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    decided_at = Column(DateTime(timezone=True), nullable=True)

class AuditLogSQL(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now, index=True)
    actor_id = Column(String(64), nullable=False)
    actor_name = Column(String(255), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    target_resource = Column(String(255), nullable=False)
    details = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False)  # SUCCESS, BLOCKED, PENDING_REVIEW
    hash = Column(String(64), nullable=False)  # SHA-256 cryptographic proof
    previous_hash = Column(String(64), nullable=True)
