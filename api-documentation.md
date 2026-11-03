# API Documentation — AgentShield AI

> Base URL: `/api/v1`  
> Auth: JWT Bearer token in `Authorization` header  
> Content-Type: `application/json` (except file uploads)

---

## Authentication

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| POST | `/auth/register` | — | — | Register new user (EMPLOYEE only) |
| POST | `/auth/login` | — | — | Authenticate, get access + refresh tokens |
| POST | `/auth/refresh` | Refresh | — | Refresh access token |
| GET | `/auth/me` | ✅ | Any | Current user profile |
| POST | `/auth/logout` | ✅ | Any | Invalidate refresh token |

### POST `/auth/register`
**Request:**
```json
{
  "email": "priya@example.com",
  "password": "SecureP@ss123",
  "full_name": "Priya Sharma",
  "department": "Engineering"
}
```
**Response (201):**
```json
{
  "user_id": "u-a1b2c3d4",
  "email": "priya@example.com",
  "full_name": "Priya Sharma",
  "role": "EMPLOYEE",
  "status": "active"
}
```
**Rules:** Public registration always assigns EMPLOYEE. MANAGER/ADMIN created by admin only.

### POST `/auth/login`
**Request:**
```json
{
  "email": "priya@example.com",
  "password": "SecureP@ss123"
}
```
**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "u-a1b2c3d4",
    "email": "priya@example.com",
    "role": "EMPLOYEE"
  }
}
```

---

## Agent Tasks

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| POST | `/agents/tasks` | ✅ | Any | Create and start a task |
| GET | `/agents/tasks` | ✅ | Any | List caller's tasks (admin sees all) |
| GET | `/agents/tasks/{task_id}` | ✅ | Owner/Mgr/Admin | Get task details |
| POST | `/agents/tasks/{task_id}/resume` | ✅ | Mgr/Admin | Resume after approval |
| POST | `/agents/tasks/{task_id}/cancel` | ✅ | Owner/Admin | Cancel eligible task |
| GET | `/agents/tasks/{task_id}/trace` | ✅ | Owner/Mgr/Admin | Get agent activity trace |

### POST `/agents/tasks`
**Request:**
```json
{
  "input_text": "Process my ₹4,500 business travel expense",
  "claim_data": {
    "amount": 4500,
    "category": "travel",
    "description": "Train ticket Mumbai-Pune",
    "merchant": "Indian Railways"
  },
  "receipt_file_id": "r-m1n2o3"
}
```
**Response (201):**
```json
{
  "task_id": "t-p4q5r6",
  "status": "QUEUED",
  "message": "Task created and queued for processing"
}
```

---

## Expense Claims

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| POST | `/claims` | ✅ | Any | Create a draft claim |
| GET | `/claims` | ✅ | Any | List claims (scoped by role) |
| GET | `/claims/{claim_id}` | ✅ | Owner/Mgr/Admin | Get claim details |
| PATCH | `/claims/{claim_id}` | ✅ | Owner | Update draft fields only |
| POST | `/claims/{claim_id}/submit` | ✅ | Owner | Submit through governed workflow |
| POST | `/claims/{claim_id}/receipt` | ✅ | Owner | Upload/attach receipt |

### POST `/claims`
**Request:**
```json
{
  "amount": 4500,
  "category": "travel",
  "description": "Business travel to Mumbai",
  "merchant": "Indian Railways",
  "expense_date": "2026-11-01"
}
```
**Response (201):**
```json
{
  "claim_id": "c-x7y8z9",
  "status": "DRAFT",
  "amount": 4500,
  "currency": "INR",
  "category": "travel",
  "created_at": "2026-11-03T10:15:00Z"
}
```

### POST `/claims/{claim_id}/receipt`
**Request:** `multipart/form-data` with `file` field  
**Allowed types:** JPEG, PNG, WebP, PDF  
**Max size:** 10 MB  
**Response (200):**
```json
{
  "receipt_id": "r-m1n2o3",
  "file_hash": "sha256:abc123...",
  "extracted_data": {
    "merchant": "Indian Railways",
    "date": "2026-11-01",
    "amount": 4500,
    "currency": "INR",
    "category": "travel"
  },
  "confidence": 0.92
}
```

---

## Approvals

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| GET | `/approvals/pending` | ✅ | Mgr/Admin | List pending approvals in scope |
| GET | `/approvals/{approval_id}` | ✅ | Mgr/Admin | Get approval details |
| POST | `/approvals/{approval_id}/approve` | ✅ | Mgr/Admin | Approve exact pending action |
| POST | `/approvals/{approval_id}/reject` | ✅ | Mgr/Admin | Reject pending action |
| GET | `/approvals/history` | ✅ | Mgr/Admin | Approval history |

### POST `/approvals/{approval_id}/approve`
**Request:**
```json
{
  "reason": "Approved - valid business expense"
}
```
**Response (200):**
```json
{
  "approval_id": "a-j1k2l3",
  "status": "APPROVED",
  "approver_id": "u-mgr001",
  "action_hash": "a1b2c3d4e5f6g7h8",
  "consumed_at": null,
  "message": "Approval recorded. Workflow will resume with revalidation."
}
```

**Approval rules enforced:**
- Approver must have MANAGER or ADMIN role
- Approver cannot approve their own request (self-approval blocked)
- Approval must be PENDING status
- Approval must not be expired
- Approval is single-use (atomic consumption)
- Action hash must match the pending action

---

## Policies

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| POST | `/policies` | ✅ | Admin | Create policy |
| GET | `/policies` | ✅ | Mgr/Admin | List policies |
| GET | `/policies/{policy_id}` | ✅ | Mgr/Admin | Get policy details |
| PUT | `/policies/{policy_id}` | ✅ | Admin | Update (creates new version) |
| DELETE | `/policies/{policy_id}` | ✅ | Admin | Deactivate (soft delete) |

### POST `/policies`
**Request:**
```json
{
  "name": "Expense Limit Policy",
  "description": "Claims above ₹5,000 require manager approval",
  "rules": [
    {
      "rule_id": "R1_AMOUNT_LIMIT",
      "rule_type": "amount_threshold",
      "parameters": { "threshold": 5000 },
      "decision": "REQUIRE_APPROVAL",
      "priority": 10,
      "description": "Claims above ₹5,000 require manager approval"
    }
  ],
  "active": true
}
```

---

## Audit Logs

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| GET | `/audit-logs` | ✅ | Mgr/Admin | Filtered audit query |
| GET | `/audit-logs/{log_id}` | ✅ | Mgr/Admin | Single event |
| GET | `/audit-logs/task/{task_id}` | ✅ | Owner/Mgr/Admin | Task audit trail |
| GET | `/audit-logs/claim/{claim_id}` | ✅ | Owner/Mgr/Admin | Claim audit trail |

### GET `/audit-logs`
**Query parameters:**
- `action` — filter by action type
- `actor_id` — filter by actor
- `decision` — ALLOW / DENY / REQUIRE_APPROVAL
- `resource_type` — claim / task / approval
- `from_date` / `to_date` — date range
- `skip` / `limit` — pagination (default: 0, 50)

---

## Evaluations

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| GET | `/evaluations/summary` | ✅ | Mgr/Admin | Latest evaluation summary |
| GET | `/evaluations/task-success` | ✅ | Mgr/Admin | Task completion metrics |
| GET | `/evaluations/policy-compliance` | ✅ | Mgr/Admin | Policy enforcement metrics |
| GET | `/evaluations/latency` | ✅ | Mgr/Admin | Latency measurements |
| POST | `/evaluations/run` | ✅ | Admin | Run benchmark suite |

---

## Dashboard

| Method | Endpoint | Auth | Role | Description |
|:-------|:---------|:----:|:----:|:------------|
| GET | `/dashboard/summary` | ✅ | Any | Dashboard KPI aggregates |
| GET | `/dashboard/activity` | ✅ | Any | Recent activity |
| GET | `/dashboard/agent-status` | ✅ | Any | Agent/task status aggregates |

### GET `/dashboard/summary`
**Response (200):**
```json
{
  "total_tasks": 142,
  "successful_tasks": 118,
  "failed_tasks": 8,
  "pending_approvals": 3,
  "blocked_actions": 16,
  "policy_violations": 16,
  "avg_execution_time_ms": 2340,
  "total_claims": 95,
  "total_amount_processed": 425000
}
```
All values computed from actual database records. No hardcoded metrics.

---

## WebSocket

**Endpoint:** `ws://host/ws/tasks/{task_id}`  
**Auth:** Token as query parameter or first message  
**Scope:** Only receive events for authorized tasks

### Events
```json
{ "event": "task_started", "task_id": "t-p4q5r6", "timestamp": "..." }
{ "event": "agent_started", "task_id": "...", "agent": "planner", "timestamp": "..." }
{ "event": "agent_completed", "task_id": "...", "agent": "planner", "result_summary": "...", "timestamp": "..." }
{ "event": "policy_checked", "task_id": "...", "decision": "REQUIRE_APPROVAL", "reasons": ["R1_AMOUNT_LIMIT"], "timestamp": "..." }
{ "event": "approval_required", "task_id": "...", "approval_id": "a-j1k2l3", "action_hash": "...", "timestamp": "..." }
{ "event": "approval_received", "task_id": "...", "verdict": "approved", "timestamp": "..." }
{ "event": "execution_completed", "task_id": "...", "claim_id": "c-x7y8z9", "timestamp": "..." }
{ "event": "task_completed", "task_id": "...", "status": "SUCCEEDED", "timestamp": "..." }
{ "event": "task_failed", "task_id": "...", "error": "...", "timestamp": "..." }
```

---

## Error Format

All errors follow a consistent structure:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You do not have permission to approve this claim",
    "correlation_id": "corr-abc123",
    "timestamp": "2026-11-03T10:20:00Z"
  }
}
```

**Common error codes:**
| Code | HTTP | Description |
|:-----|:----:|:------------|
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate or state conflict |
| `POLICY_VIOLATION` | 403 | Governance DENY decision |
| `APPROVAL_REQUIRED` | 202 | Action needs manager approval |
| `APPROVAL_EXPIRED` | 410 | Approval past expiry |
| `APPROVAL_INVALID` | 409 | Action changed since approval |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVICE_ERROR` | 503 | Backend service unavailable |
