# Architecture — AgentShield AI

> **Autonomous Intelligence. Governed Execution. Trusted Outcomes.**

---

## 1  Design Principles

| Principle | How it is enforced |
|:----------|:-------------------|
| **Governance is code, not a prompt** | Policy engine is a deterministic Python module — no LLM in the decision path |
| **Fail closed** | Any error in policy, permission, approval, or risk → DENY. No uncertain operation executes |
| **Agents propose, gateway decides** | Agents produce proposed actions; only the Governance Gateway returns ALLOW / DENY / REQUIRE_APPROVAL |
| **Exact-action approval** | Approval is bound to SHA-256 of canonical action. Any change → old approval invalid |
| **Single-use, time-bound approval** | Once consumed, approval cannot be replayed. Expired approvals are rejected |
| **Least privilege** | Agents receive only allowlisted tools. No shell, no browser, no arbitrary code |
| **Untrusted data** | Receipt text, user input, LLM output, filenames — all treated as untrusted. Never promoted to instructions |
| **Audit everything** | Every governance decision, approval action, tool execution, and failure is logged |

---

## 2  High-Level System Architecture

```mermaid
flowchart TD
    U["👤 User / Manager / Admin"] --> FE["React Frontend<br/>Vite + Tailwind + shadcn/ui"]
    FE --> API["FastAPI API Layer<br/>/api/v1/*"]
    API --> AUTH["🔐 JWT Auth + RBAC"]
    API --> TASK["Task & Claim Services"]
    TASK --> LG["🤖 LangGraph Orchestrator"]

    LG --> P["Planner Agent"]
    LG --> R["Receipt Agent"]
    LG --> V["Validation Agent"]
    LG --> E["Execution Agent"]

    P --> STATE["Shared Typed State"]
    R --> STATE
    V --> STATE
    E --> STATE

    E --> GW["🛡️ GOVERNANCE GATEWAY"]
    GW --> RBAC["Permission Manager"]
    GW --> PE["Policy Engine"]
    GW --> RISK["Risk Engine"]
    GW --> HM["Approval Manager"]

    GW -->|"ALLOW"| TOOLS["✅ Controlled Tools"]
    GW -->|"DENY"| BLOCK["❌ Blocked + Audit"]
    GW -->|"REQUIRE_APPROVAL"| PAUSE["⏸️ Pause + Await"]
    HM -->|"Approve → Revalidate"| GW
    TOOLS --> DB[("MongoDB Atlas")]
    API --> DB
    API <--> WS["WebSocket Events"]
    DB --> AUDIT["Audit & Evaluation"]

    style GW fill:#dc2626,color:#fff,stroke:#991b1b,stroke-width:3px
    style BLOCK fill:#fca5a5,stroke:#dc2626
    style PAUSE fill:#fde68a,stroke:#d97706
    style TOOLS fill:#86efac,stroke:#16a34a
```

---

## 3  Trust Boundary

```mermaid
flowchart LR
    subgraph UNTRUSTED["UNTRUSTED ZONE"]
        direction TB
        A1["User input / prompts"]
        A2["Receipt content / OCR"]
        A3["LLM output"]
        A4["Agent 'approved' flag"]
        A5["Client-supplied role"]
    end

    subgraph GATE["GOVERNANCE GATEWAY"]
        direction TB
        B1["1. Authenticate principal"]
        B2["2. Validate agent identity"]
        B3["3. Check RBAC permissions"]
        B4["4. Evaluate policies"]
        B5["5. Calculate risk"]
        B6["6. Verify approval if needed"]
        B7["7. Return ALLOW / DENY / REQUIRE_APPROVAL"]
    end

    subgraph TRUSTED["TRUSTED ZONE"]
        direction TB
        C1["Controlled tool execution"]
        C2["MongoDB write"]
        C3["Audit log"]
    end

    UNTRUSTED --> GATE --> TRUSTED

    style UNTRUSTED fill:#fef2f2,stroke:#dc2626,stroke-width:2px
    style GATE fill:#fffbeb,stroke:#d97706,stroke-width:3px
    style TRUSTED fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
```

---

## 4  Component Layers

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND — React + Vite + Tailwind + shadcn/ui     │
│  Pages: Login · Dashboard · Agent Chat · Claims     │
│         Approvals · Policies · Audit · Evaluation   │
├─────────────────────────────────────────────────────┤
│  API LAYER — FastAPI + Pydantic + WebSocket         │
│  /api/v1/auth · agents · claims · approvals ·       │
│  policies · audit-logs · evaluations · dashboard    │
├─────────────────────────────────────────────────────┤
│  IDENTITY — JWT Auth · RBAC Middleware              │
├─────────────────────────────────────────────────────┤
│  APPLICATION SERVICES — Task · Claim · Auth         │
├─────────────────────────────────────────────────────┤
│  ORCHESTRATION — LangGraph StateGraph               │
│  Planner · Receipt · Validation · Execution Agents  │
│  Checkpointer · Typed State · Conditional Edges     │
├─────────────────────────────────────────────────────┤
│  GOVERNANCE — Independent Authorization Boundary    │
│  Gateway · Policy Engine · Permission Manager       │
│  Risk Engine · Approval Manager · Audit Service     │
├─────────────────────────────────────────────────────┤
│  TOOL LAYER — Allowlisted Only                      │
│  Receipt Reader · Expense Validator                 │
│  Duplicate Checker · Claim Executor                 │
├─────────────────────────────────────────────────────┤
│  PERSISTENCE — PyMongo Repositories · Indexes       │
│  MongoDB Atlas · Local File Storage                 │
└─────────────────────────────────────────────────────┘
```

---

## 5  Technology Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | React 18 · Vite 6 · JavaScript · Tailwind CSS 3 · shadcn/ui · Axios · Recharts · React Router 6 |
| Backend | Python 3.10 · FastAPI · Pydantic v2 · PyMongo · WebSockets |
| Auth | JWT (PyJWT) · bcrypt password hashing |
| Agents | LangGraph · LangChain Core · Gemini API (langchain-google-genai) |
| Database | MongoDB Atlas · PyMongo 4.16 |
| Testing | Pytest · FastAPI TestClient · httpx |
| Deployment | Docker · Docker Compose |

---

## 6  LangGraph Workflow

```mermaid
stateDiagram-v2
    [*] --> Plan: User submits task

    Plan --> ExtractReceipt: Plan created
    ExtractReceipt --> Validate: Data extracted
    Validate --> PrepareAction: Validation passed

    PrepareAction --> GovernanceGate: Proposed action ready

    GovernanceGate --> Execute: ALLOW
    GovernanceGate --> Block: DENY
    GovernanceGate --> WaitApproval: REQUIRE_APPROVAL

    WaitApproval --> Revalidate: Manager approves
    WaitApproval --> Block: Manager rejects
    WaitApproval --> Block: Approval expired

    Revalidate --> Execute: Fresh ALLOW
    Revalidate --> Block: Fresh DENY

    Execute --> [*]: SUCCEEDED
    Block --> [*]: DENIED / FAILED
```

---

## 7  Approval Sequence Diagram

```mermaid
sequenceDiagram
    participant E as Employee
    participant API as FastAPI
    participant LG as LangGraph
    participant GW as Governance Gateway
    participant PE as Policy Engine
    participant AM as Approval Manager
    participant M as Manager
    participant DB as MongoDB

    E->>API: POST /agents/tasks (₹9,000 expense)
    API->>DB: Create task (QUEUED)
    API->>LG: Start workflow

    LG->>LG: Plan → Extract → Validate → Prepare
    LG->>GW: Evaluate proposed action

    GW->>PE: Check active policies
    PE-->>GW: R1_AMOUNT_LIMIT → REQUIRE_APPROVAL

    GW->>AM: Create approval (action_hash bound)
    AM->>DB: Store pending approval
    GW-->>LG: REQUIRE_APPROVAL

    LG->>LG: interrupt() — graph pauses
    LG-->>API: Task: WAITING_FOR_APPROVAL
    API-->>E: Status update via WebSocket

    M->>API: GET /approvals/pending
    API-->>M: Show proposed action + risk + policy reasons

    M->>API: POST /approvals/{id}/approve
    API->>AM: Verify: manager role + not self + not expired
    AM->>DB: Atomic approval consumption

    API->>LG: Resume (Command)
    LG->>GW: Re-evaluate (fresh policy + approval verify)
    GW->>PE: Fresh policy check
    GW->>AM: Verify hash match + single-use
    GW-->>LG: ALLOW

    LG->>DB: Create claim (idempotent)
    LG->>DB: Write audit event
    LG-->>API: SUCCEEDED
    API-->>E: Final result via WebSocket
```

---

## 8  Deployment Diagram

```mermaid
flowchart LR
    subgraph Client
        Browser["Browser"]
    end

    subgraph Frontend["Frontend Host"]
        React["React SPA<br/>(Vite build)"]
    end

    subgraph Backend["Backend Host"]
        FastAPI["FastAPI Server<br/>(uvicorn)"]
        Storage["Local File Storage<br/>(receipts)"]
    end

    subgraph Database["MongoDB Atlas"]
        Mongo[("MongoDB<br/>Replica Set")]
    end

    Browser --> React
    React --> FastAPI
    FastAPI --> Mongo
    FastAPI --> Storage

    style Database fill:#f0fdf4,stroke:#16a34a
```
