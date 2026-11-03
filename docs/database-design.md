# AgentShield AI - MongoDB Database Schema & Index Design

## 1. Overview

AgentShield AI uses **MongoDB Atlas** with PyMongo repositories. The schema is organized into 10 discrete collections mapped to application domain boundaries.

```
+--------------------+           +----------------------+
|       users        |           |        roles         |
+--------------------+           +----------------------+
| _id                |           | name                 |
| email (unique)     |           | permissions          |
| role               |           +----------------------+
+--------------------+
          |
          | 1:N
          v
+--------------------+           +----------------------+
|    agent_tasks     | --------> |     receipts         |
+--------------------+           +----------------------+
| task_id (unique)   |           | receipt_id (unique)  |
| requester_id       |           | file_hash (unique)   |
| prompt             |           | storage_key          |
| status             |           | extracted_data       |
| plan               |           +----------------------+
| governance_decision|
| action_hash        |
+--------------------+
          |
          | 1:1
          v
+--------------------+           +----------------------+
|   expense_claims   | <-------> |      approvals       |
+--------------------+           +----------------------+
| claim_id (unique)  |           | approval_id (unique) |
| amount, currency   |           | task_id              |
| merchant, category |           | action_hash (SHA-256)|
| status             |           | status (PENDING...)  |
| idempotency_key    |           | expires_at           |
+--------------------+           +----------------------+
          |                                 |
          +----------------+----------------+
                           |
                           v
              +--------------------------+
              |        audit_logs        |
              +--------------------------+
              | event_id (unique)        |
              | correlation_id           |
              | actor, action, resource  |
              | decision, reason_codes   |
              | timestamp                |
              +--------------------------+
```

## 2. Collection Specifications

### 2.1 `users`
- `_id`: ObjectId
- `email`: String (Unique index, normalized lowercase)
- `password_hash`: String (Argon2id or bcrypt)
- `name`: String
- `role`: Enum (`EMPLOYEE` | `MANAGER` | `ADMIN`)
- `department`: String
- `status`: Enum (`ACTIVE` | `SUSPENDED`)
- `created_at`: ISODate

### 2.2 `policies`
- `policy_id`: String (Unique index)
- `policy_code`: String (e.g. `POL-THR-03`)
- `name`: String
- `description`: String
- `rule_type`: String (`THRESHOLD_APPROVAL`, `MANDATORY_DOCUMENT`, `CATEGORY_RESTRICTION`, `DUPLICATE_DETECTION`)
- `threshold`: Number (Optional, e.g. 5000)
- `currency`: String (Default: `INR`)
- `active`: Boolean
- `version`: String (`v1.0.0`)
- `updated_at`: ISODate
- `updated_by`: String

### 2.3 `agent_tasks`
- `task_id`: String (Unique index)
- `requester_id`: Reference (`users._id`)
- `prompt`: String
- `status`: Enum (`QUEUED`, `RUNNING`, `WAITING_FOR_APPROVAL`, `SUCCEEDED`, `FAILED`, `CANCELLED`)
- `plan`: Array of Subtask Objects
- `governance_decision`: Enum (`ALLOW`, `REQUIRE_APPROVAL`, `DENY`)
- `action_hash`: String (SHA-256 canonical hash)
- `created_at`: ISODate

### 2.4 `approvals`
- `approval_id`: String (Unique index)
- `task_id`: Reference (`agent_tasks.task_id`)
- `claim_id`: Reference (`expense_claims.claim_id`)
- `requester_id`: Reference (`users._id`)
- `approver_id`: Reference (`users._id`, null until resolved)
- `proposed_action`: Canonical Object
- `action_hash`: String (SHA-256)
- `trigger_rule`: String
- `risk_score`: Number (0-100)
- `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `INVALIDATED`)
- `consumed`: Boolean (Atomic single-use guarantee)
- `expires_at`: ISODate
- `resolved_at`: ISODate

### 2.5 `audit_logs`
- `event_id`: String (Unique index)
- `correlation_id`: String (Index)
- `actor`: String
- `actor_type`: Enum (`AGENT`, `GOVERNANCE`, `USER_EMPLOYEE`, `USER_MANAGER`, `USER_ADMIN`)
- `action`: String
- `resource`: String
- `governance_decision`: Enum (`ALLOW`, `REQUIRE_APPROVAL`, `DENY`)
- `reason_codes`: Array of Strings
- `timestamp`: ISODate (Index)
- `details`: String

