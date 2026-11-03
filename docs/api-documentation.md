# AgentShield AI - API Contracts & Endpoints Specification

Base URL: `/api/v1`

## 1. Authentication & RBAC

- `POST /auth/register`
  - Body: `{ email, password, full_name }` (Default role: `EMPLOYEE`)
  - Response: `{ user_id, email, full_name, role, token }`
- `POST /auth/login`
  - Body: `{ email, password }`
  - Response: `{ access_token, token_type: "bearer", user: { id, email, full_name, role } }`
- `GET /auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: Current user profile and effective permissions

## 2. Agent Tasks & Orchestration

- `POST /agents/tasks`
  - Body: `{ prompt: string, receipt_file_id?: string, metadata?: object }`
  - Response: `{ task_id, status: "QUEUED" | "RUNNING", created_at }`
- `GET /agents/tasks`
  - Query: `?status=&limit=&offset=`
  - Response: List of user-accessible tasks
- `GET /agents/tasks/{task_id}`
  - Response: Full task record, including planner output, extracted receipt data, validation findings, proposed action, governance decision, and execution status
- `POST /agents/tasks/{task_id}/resume`
  - Body: `{ approval_id: string }`
  - Response: `{ task_id, status: "RUNNING" | "SUCCEEDED" | "FAILED" }`
- `POST /agents/tasks/{task_id}/cancel`
  - Response: `{ task_id, status: "CANCELLED" }`

## 3. Expense Claims & Receipts

- `POST /claims`
  - Body: `{ amount: number, currency: string, merchant: string, category: string, receipt_id: string }`
  - Response: `{ claim_id, status: "DRAFT" }`
- `GET /claims`
  - Query: `?status=&category=&limit=`
  - Response: Paginated claims list
- `GET /claims/{claim_id}`
  - Response: Detailed claim document
- `POST /claims/{claim_id}/receipt`
  - Multipart Form: `file: binary`
  - Response: `{ receipt_id, file_hash, file_name, extracted_data }`

## 4. Human Approvals

- `GET /approvals/pending`
  - Role: `MANAGER` or `ADMIN`
  - Response: List of pending approval requests awaiting action
- `GET /approvals/{approval_id}`
  - Response: Pending action canonical details, cryptographic hash, risk score, and expiry
- `POST /approvals/{approval_id}/approve`
  - Role: `MANAGER` or `ADMIN`
  - Body: `{ reason?: string }`
  - Response: `{ approval_id, status: "APPROVED", approved_at, approver_id }`
- `POST /approvals/{approval_id}/reject`
  - Role: `MANAGER` or `ADMIN`
  - Body: `{ reason: string }`
  - Response: `{ approval_id, status: "REJECTED", rejected_at }`

## 5. Policy Engine Management

- `GET /policies`
  - Response: List of configured deterministic policy rules (active and inactive)
- `POST /policies`
  - Role: `ADMIN`
  - Body: `{ name, description, rule_type, condition, threshold, active }`
  - Response: `{ policy_id, version: "v1.0.0" }`
- `PUT /policies/{policy_id}`
  - Role: `ADMIN`
  - Body: `{ threshold?, active?, condition? }`
  - Response: Updated policy with incremented version string

## 6. Audit & Benchmark Evaluations

- `GET /audit-logs`
  - Query: `?actor=&action=&decision=&from=&to=`
  - Response: Security and business audit event records
- `GET /evaluations/summary`
  - Response: `{ total_runs, task_completion_rate, policy_accuracy, unauthorized_executions: 0, avg_latency_ms }`
- `POST /evaluations/run`
  - Role: `ADMIN` or `MANAGER`
  - Response: Triggers standard 50-benchmark evaluation test suite
- `GET /dashboard/summary`
  - Response: KPI aggregates, task trends, policy violation counts, and pending approval counts

