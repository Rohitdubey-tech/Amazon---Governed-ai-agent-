# Workflow Specification & Lifecycle — AgentShield AI

## 1. End-to-End Workflow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee / Requester
    actor Manager as Authorizing Manager
    participant UI as React Frontend
    participant API as FastAPI Backend Layer
    participant DB as MongoDB Persistence
    participant LG as LangGraph Orchestrator
    participant GW as Governance Gateway
    participant Tool as Controlled Tools

    User->>UI: Submits task (e.g. "Process ₹8,500 travel reimbursement") + Receipt file
    UI->>API: POST /api/v1/agents/tasks (with JWT & Payload)
    API->>DB: Persist Task Document (status: QUEUED)
    API->>LG: Initialize Workflow Graph with Thread ID

    rect rgb(240, 248, 255)
        Note over LG: Autonomous Agent Sub-Phase
        LG->>LG: Node 1: Planner Agent (Deconstructs goal & maps pipeline)
        LG->>LG: Node 2: Receipt Agent (Extracts merchant, amount, category, date)
        LG->>LG: Node 3: Validation Agent (Checks required fields & duplicate hashes)
        LG->>LG: Node 4: Execution Agent (Prepares canonical proposed action)
    end

    LG->>GW: evaluate(proposed_action, context, principal)
    
    rect rgb(255, 245, 230)
        Note over GW: Independent Governance Boundary
        GW->>DB: Fetch Active Organization Policies
        GW->>GW: Evaluate Policies (Deterministic rules)
        GW->>GW: Compute Risk Assessment (Score: 68/100, Tier: MEDIUM)
    end

    alt Policy Decision == ALLOW (Under ₹5,000 threshold & compliant)
        GW-->>LG: Decision: ALLOW
        LG->>Tool: Invoke submit_claim(action.args)
        Tool->>DB: Store Final Claim & Tool Execution Record
        Tool-->>LG: Result: SUCCESS
        LG->>DB: Update Task (status: SUCCEEDED)
        LG-->>UI: WebSocket event: task_completed
    else Policy Decision == DENY (Banned category, duplicate, unauthorized)
        GW-->>LG: Decision: DENY (reasons: [R2_BANNED_CATEGORY])
        LG->>DB: Update Task (status: DENIED, reasons logged)
        LG->>DB: Write Audit Event
        LG-->>UI: WebSocket event: task_failed (DENIED)
    else Policy Decision == REQUIRE_APPROVAL (Amount > ₹5,000 or Daily Cap reached)
        GW->>DB: Create Approval Document (status: PENDING, action_hash: SHA256)
        GW-->>LG: Decision: REQUIRE_APPROVAL
        LG->>LG: Execute interrupt(payload) — GRAPH PAUSES EXECUTION
        LG->>DB: Checkpoint Graph State & Update Task (status: WAITING_FOR_APPROVAL)
        LG-->>UI: WebSocket event: approval_required

        Note over Manager, UI: Human Oversight Sub-Phase
        Manager->>UI: Navigates to Manager Approvals Queue
        UI->>API: GET /api/v1/approvals/pending
        API-->>UI: Returns Pending Approvals within Manager Scope
        Manager->>UI: Reviews exact proposed action, risk factors, and receipt
        Manager->>API: POST /api/v1/approvals/{id}/approve (with reason)
        API->>DB: Atomic Update Approval (status: APPROVED, consumed_at: timestamp)
        
        API->>LG: Resume Graph via Command(resume=approval_payload)
        
        rect rgb(230, 255, 240)
            Note over LG, GW: Revalidation Phase
            LG->>GW: revalidate(approval_id, current_action, principal)
            GW->>GW: Verify Approver Role (must be MANAGER/ADMIN)
            GW->>GW: Verify Hash Match (current_hash == approval.action_hash)
            GW->>GW: Verify Single-Use & Expiry Window
            GW->>GW: Fresh Policy Evaluation (World state hasn't changed)
            GW-->>LG: Decision: ALLOW
        end

        LG->>Tool: Invoke submit_claim(action.args, approved_by=Manager)
        Tool->>DB: Store Final Claim (status: SUBMITTED)
        Tool-->>LG: Result: SUCCESS
        LG->>DB: Update Task (status: SUCCEEDED)
        LG-->>UI: WebSocket event: task_completed
    end
```

---

## 2. State Machine Formal Definitions

### 2.1 Task State Machine (`agent_tasks`)
```
 ┌──────────┐
 │  QUEUED  │
 └────┬─────┘
      │ Orchestration Worker Pops Task
      ▼
 ┌──────────┐
 │ RUNNING  │◄─────────────────────────────┐
 └────┬─────┘                              │
      │                                    │ Manager Approved
      ├──────────────┬─────────────────┐   │ & Revalidation Passes
      │              │                 │   │
      │ ALLOW        │ DENY            │ REQUIRE_APPROVAL
      ▼              ▼                 ▼   │
 ┌──────────┐   ┌──────────┐   ┌──────────────────────┐
 │SUCCEEDED │   │  DENIED  │   │ WAITING_FOR_APPROVAL │
 └──────────┘   └──────────┘   └──────────┬───────────┘
                                          │
                                          ├───────────────┐
                                          │ Rejected      │ Expired /
                                          ▼               ▼ Invalidated
                                     ┌──────────┐   ┌───────────┐
                                     │  DENIED  │   │  EXPIRED  │
                                     └──────────┘   └───────────┘
```

**Permitted Transitions:**
- `QUEUED` → `RUNNING`, `CANCELLED`
- `RUNNING` → `SUCCEEDED`, `DENIED`, `WAITING_FOR_APPROVAL`, `FAILED`
- `WAITING_FOR_APPROVAL` → `RUNNING` (upon approval resume), `DENIED` (upon rejection), `EXPIRED` (timeout)
- Terminal States: `SUCCEEDED`, `DENIED`, `FAILED`, `CANCELLED`, `EXPIRED`

---

### 2.2 Approval Lifecycle State Machine (`approvals`)

```
 ┌───────────┐
 │  PENDING  │
 └─────┬─────┘
       │
       ├───────────────────┬───────────────────┬──────────────────┐
       │ Manager Approves  │ Manager Rejects   │ TTL Exceeded     │ Action Tampered
       ▼                   ▼                   ▼                  ▼
 ┌───────────┐       ┌───────────┐       ┌───────────┐      ┌─────────────┐
 │ APPROVED  │       │ REJECTED  │       │  EXPIRED  │      │ INVALIDATED │
 └─────┬─────┘       └───────────┘       └───────────┘      └─────────────┘
       │
       │ Atomic Execution Consumption
       ▼
 ┌───────────┐
 │ CONSUMED  │ (Single-use complete; replay impossible)
 └───────────┘
```

---

## 3. Exact-Action Cryptographic Binding

To prevent **Time-of-Check to Time-of-Use (TOCTOU)** attacks and parameter mutation after sign-off, approvals are bound to a cryptographic digest:

### Canonical Digest Formula:
$$\text{ActionHash} = \text{SHA256}\Big(\text{CanonicalJSON}\big(\text{tool}, \text{sorted}(\text{essential\_args})\big)\Big)_{0..16}$$

- **Included Arguments:** `tool`, `employee`, `amount`, `currency`, `category`, `receipt_id`, `merchant`.
- **Excluded Arguments:** Free-form user comments, decorative UI notes, display timestamps.
- **Verification Rule:** If any financial or operational field is altered between the manager's review and the revalidation check, $\text{ActionHash}_{\text{current}} \neq \text{ActionHash}_{\text{approved}}$, immediately invalidating the workflow and transitioning the task to `DENIED`.
