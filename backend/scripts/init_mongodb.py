#!/usr/bin/env python3
"""
AgentShield AI - MongoDB Database Initializer & Seeder
Connects to MongoDB, creates the 'agentshield_ai' database, sets up collections and indexes,
and seeds initial corporate governance data (users, policies, claims, tasks, approvals, audit logs).
"""

import os
import sys
import logging
import bcrypt
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("init_mongodb")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DATABASE", "agentshield_ai")

def init_database():
    logger.info(f"Connecting to MongoDB at {MONGODB_URI}...")
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        logger.info("Successfully connected to MongoDB server!")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB at {MONGODB_URI}: {e}")
        sys.exit(1)

    db = client[DB_NAME]
    now = datetime.now(timezone.utc).isoformat()
    now_dt = datetime.now(timezone.utc)
    exp_iso = (now_dt + timedelta(days=3)).isoformat()

    # 1. Users Collection
    logger.info("Setting up 'users' collection...")
    users_col = db["users"]
    users_col.create_index([("email", ASCENDING)], unique=True)
    users_col.create_index([("id", ASCENDING)], unique=True)

    salt = bcrypt.gensalt()
    default_pw_hash = bcrypt.hashpw("password123".encode("utf-8"), salt).decode("utf-8")

    initial_users = [
        {
            "id": "usr_emp_01",
            "email": "priya.sharma@shieldcorp.io",
            "password_hash": default_pw_hash,
            "name": "Priya Sharma",
            "role": "EMPLOYEE",
            "department": "Engineering",
            "status": "ACTIVE",
            "created_at": now
        },
        {
            "id": "usr_mgr_01",
            "email": "vikram.malhotra@shieldcorp.io",
            "password_hash": default_pw_hash,
            "name": "Vikram Malhotra",
            "role": "MANAGER",
            "department": "Engineering Leadership",
            "status": "ACTIVE",
            "created_at": now
        },
        {
            "id": "usr_adm_01",
            "email": "ananya.sen@shieldcorp.io",
            "password_hash": default_pw_hash,
            "name": "Ananya Sen",
            "role": "ADMIN",
            "department": "InfoSec & Governance",
            "status": "ACTIVE",
            "created_at": now
        }
    ]
    for u in initial_users:
        users_col.update_one({"id": u["id"]}, {"$set": u}, upsert=True)

    # 2. Policies Collection
    logger.info("Setting up 'policies' collection...")
    policies_col = db["policies"]
    policies_col.create_index([("policy_code", ASCENDING)], unique=True)
    policies_col.create_index([("id", ASCENDING)], unique=True)

    initial_policies = [
        {
            "id": "pol_rec_001",
            "policy_code": "POL-REC-01",
            "name": "Receipt Mandatory Policy",
            "description": "Every claimed expense must have an authentic, verifiable receipt attached with OCR extraction confidence >= 70%.",
            "rule_type": "MANDATORY_DOCUMENT",
            "threshold": None,
            "currency": "INR",
            "prohibited_categories": None,
            "time_window_days": None,
            "enforcement": "HARD_DENY",
            "active": True,
            "version": "v1.2.0",
            "updated_at": now,
            "updated_by": "Ananya Sen (ADMIN)"
        },
        {
            "id": "pol_pers_002",
            "policy_code": "POL-CAT-02",
            "name": "Prohibition of Personal Expenses",
            "description": "Personal entertainment, gaming, luxury retail, or non-business items are strictly prohibited.",
            "rule_type": "CATEGORY_RESTRICTION",
            "threshold": None,
            "currency": "INR",
            "prohibited_categories": ["Personal", "Gaming", "Luxury", "Crypto"],
            "time_window_days": None,
            "enforcement": "HARD_DENY",
            "active": True,
            "version": "v1.0.1",
            "updated_at": now,
            "updated_by": "Ananya Sen (ADMIN)"
        },
        {
            "id": "pol_thr_003",
            "policy_code": "POL-THR-03",
            "name": "Manager Approval Threshold Limit",
            "description": "Single expense claims exceeding ₹5,000 require independent managerial authorization before execution.",
            "rule_type": "THRESHOLD_APPROVAL",
            "threshold": 5000.0,
            "currency": "INR",
            "prohibited_categories": None,
            "time_window_days": None,
            "enforcement": "REQUIRE_APPROVAL",
            "active": True,
            "version": "v2.1.0",
            "updated_at": now,
            "updated_by": "Ananya Sen (ADMIN)"
        },
        {
            "id": "pol_dup_004",
            "policy_code": "POL-DUP-04",
            "name": "Duplicate Claim & Fingerprint Ban",
            "description": "Re-submission of identical receipt file hashes or matching merchant + date + amount combinations within 90 days is rejected.",
            "rule_type": "DUPLICATE_DETECTION",
            "threshold": None,
            "currency": "INR",
            "prohibited_categories": None,
            "time_window_days": 90,
            "enforcement": "HARD_DENY",
            "active": True,
            "version": "v1.3.0",
            "updated_at": now,
            "updated_by": "Ananya Sen (ADMIN)"
        }
    ]
    for p in initial_policies:
        policies_col.update_one({"id": p["id"]}, {"$set": p}, upsert=True)

    # 3. Expense Claims Collection
    logger.info("Setting up 'expense_claims' collection...")
    claims_col = db["expense_claims"]
    claims_col.create_index([("id", ASCENDING)], unique=True)
    claims_col.create_index([("user_id", ASCENDING)])
    claims_col.create_index([("status", ASCENDING)])

    initial_claims = [
        {
            "id": "clm_8941",
            "task_id": "tsk_7721",
            "user_id": "usr_emp_01",
            "user_name": "Priya Sharma",
            "user_email": "priya.sharma@shieldcorp.io",
            "merchant": "IndiGo Airlines",
            "amount": 4500.0,
            "currency": "INR",
            "category": "Travel",
            "date": "2026-11-01",
            "receipt_id": "rcpt_indi_992",
            "receipt_name": "indigo_flight_del_blr.pdf",
            "status": "PROCESSED",
            "governance_decision": "ALLOW",
            "approval_id": None,
            "risk_score": 18,
            "risk_level": "LOW",
            "block_reason": None,
            "action_hash": "a1b2c3d4e5f60102030405060708090a1b2c3d4e5f60102030405060708090a1",
            "created_at": now,
            "executed_at": now
        },
        {
            "id": "clm_8942",
            "task_id": "tsk_7725",
            "user_id": "usr_emp_01",
            "user_name": "Priya Sharma",
            "user_email": "priya.sharma@shieldcorp.io",
            "merchant": "Apple Authorized Reseller",
            "amount": 14200.0,
            "currency": "INR",
            "category": "Hardware",
            "date": "2026-11-02",
            "receipt_id": "rcpt_appl_441",
            "receipt_name": "usb_c_monitor_dock.pdf",
            "status": "WAITING_FOR_APPROVAL",
            "governance_decision": "REQUIRE_APPROVAL",
            "approval_id": "appr_9901",
            "risk_score": 65,
            "risk_level": "MEDIUM",
            "block_reason": None,
            "action_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "created_at": now,
            "executed_at": None
        },
        {
            "id": "clm_8943",
            "task_id": "tsk_7729",
            "user_id": "usr_emp_01",
            "user_name": "Priya Sharma",
            "user_email": "priya.sharma@shieldcorp.io",
            "merchant": "PlayStation Network Store",
            "amount": 3999.0,
            "currency": "INR",
            "category": "Gaming",
            "date": "2026-11-03",
            "receipt_id": "rcpt_psn_110",
            "receipt_name": "psn_digital_voucher.pdf",
            "status": "REJECTED",
            "governance_decision": "DENY",
            "approval_id": None,
            "risk_score": 92,
            "risk_level": "HIGH",
            "block_reason": "POL-CAT-02: Personal entertainment and gaming expenses prohibited.",
            "action_hash": "b4c5d6e7f8091011121314151617181920212223242526272829303132333435",
            "created_at": now,
            "executed_at": None
        }
    ]
    for c in initial_claims:
        claims_col.update_one({"id": c["id"]}, {"$set": c}, upsert=True)

    # 4. Agent Tasks Collection
    logger.info("Setting up 'agent_tasks' collection...")
    tasks_col = db["agent_tasks"]
    tasks_col.create_index([("id", ASCENDING)], unique=True)
    tasks_col.create_index([("user_id", ASCENDING)])
    tasks_col.create_index([("status", ASCENDING)])

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
        tasks_col.update_one({"id": t["id"]}, {"$set": t}, upsert=True)

    # 5. Approvals Collection
    logger.info("Setting up 'approvals' collection...")
    approvals_col = db["approvals"]
    approvals_col.create_index([("id", ASCENDING)], unique=True)
    approvals_col.create_index([("claim_id", ASCENDING)])
    approvals_col.create_index([("status", ASCENDING)])

    initial_approvals = [
        {
            "id": "appr_9901",
            "task_id": "tsk_7725",
            "claim_id": "clm_8942",
            "requester_id": "usr_emp_01",
            "requester_name": "Priya Sharma",
            "requester_email": "priya.sharma@shieldcorp.io",
            "proposed_action": {
                "operation": "SUBMIT_EXPENSE_CLAIM",
                "amount": 14200.0,
                "currency": "INR",
                "merchant": "Apple Authorized Reseller",
                "category": "Hardware",
                "receipt_id": "rcpt_appl_441",
                "idempotency_key": "idem_act_apple_14200_9901"
            },
            "action_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "trigger_rule": "POL-THR-03 (Amount ₹14,200 exceeds ₹5,000 threshold)",
            "risk_score": 65,
            "risk_level": "MEDIUM",
            "risk_factors": [
                "Amount ₹14,200 is 184% over base manager review limit (₹5,000)",
                "High-value hardware category with secondary asset tracking requirement",
                "First hardware purchase submitted in current quarter"
            ],
            "status": "PENDING",
            "created_at": now,
            "expires_at": exp_iso,
            "consumed": False,
            "approver_id": None,
            "approver_name": None,
            "approval_reason": None,
            "rejection_reason": None,
            "resolved_at": None
        }
    ]
    for a in initial_approvals:
        approvals_col.update_one({"id": a["id"]}, {"$set": a}, upsert=True)

    # 6. Audit Logs Collection
    logger.info("Setting up 'audit_logs' collection...")
    audit_col = db["audit_logs"]
    audit_col.create_index([("id", ASCENDING)], unique=True)
    audit_col.create_index([("timestamp", ASCENDING)])
    audit_col.create_index([("correlation_id", ASCENDING)])

    initial_audits = [
        {
            "id": "aud_1001",
            "correlation_id": "corr_91823719",
            "timestamp": now,
            "actor": "agent:ExecutionAgent",
            "actor_type": "AGENT",
            "action": "PROPOSE_SENSITIVE_TOOL_EXECUTION",
            "resource": "tool:submit_simulated_claim",
            "governance_decision": "ALLOW",
            "reason_codes": ["POL_REC_PASS", "POL_CAT_PASS", "UNDER_THRESHOLD"],
            "details": "Governance Gateway approved execution for Claim clm_8941 (₹4,500 INR). All deterministic rules passed."
        },
        {
            "id": "aud_1002",
            "correlation_id": "corr_91823788",
            "timestamp": now,
            "actor": "agent:ExecutionAgent",
            "actor_type": "AGENT",
            "action": "PROPOSE_SENSITIVE_TOOL_EXECUTION",
            "resource": "tool:submit_simulated_claim",
            "governance_decision": "REQUIRE_APPROVAL",
            "reason_codes": ["POL_THR_03_TRIGGERED"],
            "details": "Threshold ₹5,000 exceeded (Amount: ₹14,200). Paused graph state. Approval appr_9901 created with cryptographic hash binding."
        },
        {
            "id": "aud_1003",
            "correlation_id": "corr_91823812",
            "timestamp": now,
            "actor": "gateway:PolicyEngine",
            "actor_type": "GOVERNANCE",
            "action": "EVALUATE_POLICY",
            "resource": "claim:clm_8943",
            "governance_decision": "DENY",
            "reason_codes": ["POL_PERS_002_VIOLATION"],
            "details": "Hard deny triggered. Prohibited category 'Personal / Gaming'. Execution halted safely with 0 side effects."
        }
    ]
    for al in initial_audits:
        audit_col.update_one({"id": al["id"]}, {"$set": al}, upsert=True)

    # Verification summary
    collections = db.list_collection_names()
    logger.info("=" * 60)
    logger.info(f"MONGODB DATABASE '{DB_NAME}' SUCCESSFULLY CREATED & INITIALIZED!")
    logger.info("=" * 60)
    for col_name in sorted(collections):
        count = db[col_name].count_documents({})
        logger.info(f"  • Collection: {col_name.ljust(20)} -> {count} documents")
    logger.info("=" * 60)

if __name__ == "__main__":
    init_database()

