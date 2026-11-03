# Multi-Agent Workflow & Approval Lifecycle

## 1. Specialist Agents Breakdown

AgentShield orchestrates 4 specialist agents in an untrusted planning space:

1. **Planner Agent** ([`specialist_agents.py`](file:///Users/rohitkumardubey/Desktop/AgentShield%20Ai/backend/app/agents/specialist_agents.py)):
   - Decomposes the user natural-language prompt into an execution graph.
   - Extracts candidate amounts, merchants, and dates.
   - Scans prompt for adversarial prompt injection patterns.

2. **Receipt Agent** ([`specialist_agents.py`](file:///Users/rohitkumardubey/Desktop/AgentShield%20Ai/backend/app/agents/specialist_agents.py)):
   - Interfaces with document storage to extract OCR content.
   - Normalizes vendor metadata, total amount, currency (`INR`), and tax identifiers (`GSTIN`).
   - Strictly sanitizes text to prevent indirect prompt injection.

3. **Validation Agent** ([`specialist_agents.py`](file:///Users/rohitkumardubey/Desktop/AgentShield%20Ai/backend/app/agents/specialist_agents.py)):
   - Asserts mandatory schema fields (`merchant`, `amount`, `category`, `receipt_name`).
   - Verifies OCR confidence score (rejects if below acceptable thresholds).
   - Flags suspicious patterns or duplicate candidates.

4. **Execution Agent** ([`specialist_agents.py`](file:///Users/rohitkumardubey/Desktop/AgentShield%20Ai/backend/app/agents/specialist_agents.py)):
   - Formulates the typed `ProposedAction`.
   - Computes unique idempotency token (`idem_<task_id>_<random>`).
   - **Crucially: Does NOT execute the tool directly.** Hands the `ProposedAction` to the independent Governance Gateway.

---

## 2. Governance Gateway Evaluation

The Governance Gateway evaluates the action against active corporate policies:

* **ALLOW**:
  - Proposed action is clean, has authentic receipt proof, is in a legitimate category, and is below the threshold limit.
  - Gateway authorizes the allowlisted `ClaimExecutorTool` with the single-use idempotency key.
  - Task marked `SUCCEEDED`, claim marked `PROCESSED`.

* **REQUIRE_APPROVAL**:
  - Proposed action exceeds corporate spend threshold (> ₹5,000).
  - Workflow is paused (`WAITING_FOR_APPROVAL`).
  - Canonical JSON SHA-256 action hash is generated and cryptographically bound to a pending approval record.
  - An out-of-band notification appears on the manager's dashboard.

* **DENY**:
  - Action violates hard corporate rules (e.g. `POL-REC-01` missing receipt, `POL-CAT-02` personal expense, `POL-DUP-04` duplicate claim, or `POL-SEC-05` prompt injection).
  - Workflow is aborted immediately (`FAILED` / `BLOCKED`).
  - An immutable security event is logged in `audit_logs`.

---

## 3. Human-in-the-Loop Resumption & Anti-Tamper Defense

When a manager approves a pending claim:
1. **RBAC Guard**: Employee attempting approval is rejected with `403 Forbidden`.
2. **Exact-Action Integrity Check**: Gateway recomputes the SHA-256 hash of the proposal.
   - If payload was modified in database/transit: `400 SECURITY_VIOLATION`, token marked `INVALIDATED`.
3. **Execution & Single-Use Consumption**:
   - The approval token is consumed (`consumed: true`). It cannot be reused.
   - The allowlisted tool is invoked, updating the claim to `PROCESSED`.
   - Audit log records the manager email, timestamp, and action hash.

