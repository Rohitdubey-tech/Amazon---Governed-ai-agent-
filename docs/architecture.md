# AgentShield AI — Architecture & System Design

## 1. System Overview & Trust Boundary

AgentShield AI is an enterprise-grade, policy-governed framework for secure, autonomous AI agent execution. While modern LLM agents can autonomously decompose goals and propose workflows, they must **never** hold the authority to approve or execute privileged actions. 

AgentShield enforces a strict, independent **Trust Boundary**: the LLM and its specialist agents operate in an untrusted planning space, while all sensitive operations (e.g., expense disbursements, database writes, external mutations) are mediated by an independent, deterministic **Governance Gateway**.

---

## 2. Mermaid System Design Diagrams (All 10 Core Views)

### Diagram 1: High-Level System Architecture
```mermaid
flowchart TD
    subgraph UntrustedZone["Untrusted Planning Space"]
        User["Corporate Employee / Manager"]
        UI["React 19 Frontend UI"]
        Planner["Planner Agent"]
        Receipt["Receipt OCR Agent"]
        Validator["Validation Agent"]
        ExecAgent["Execution Agent (Proposal Only)"]
    end

    subgraph TrustBoundary["Non-Negotiable Trust Boundary"]
        Gateway["Independent Governance Gateway"]
    end

    subgraph GovernanceCore["Deterministic Governance Engine"]
        PolicyEng["Policy Engine (POL Rules)"]
        RiskEng["Explainable Risk Engine"]
        RBAC["RBAC & Identity Guard"]
        Crypto["SHA-256 Canonical Action Hasher"]
    end

    subgraph ControlledSpace["Privileged Controlled Execution Space"]
        Tool["Claim Executor (Idempotent Disbursement)"]
        DB[(MongoDB Atlas / In-Memory State)]
        AuditLog[(Immutable Audit Log)]
        Manager["Human Approver (Manager / Admin)"]
    end

    User --> UI
    UI -->|Natural Language Prompt| Planner
    Planner --> Receipt
    Receipt --> Validator
    Validator --> ExecAgent
    ExecAgent -->|Proposed Action| Gateway
    Gateway --> PolicyEng
    Gateway --> RiskEng
    Gateway --> RBAC
    Gateway --> Crypto

    Gateway -->|ALLOW| Tool
    Gateway -->|REQUIRE_APPROVAL| Manager
    Gateway -->|DENY| UI

    Manager -->|Verify Hash & Approve| Gateway
    Tool --> DB
    Gateway --> AuditLog
```

### Diagram 2: End-to-End Workflow Flowchart
```mermaid
flowchart TD
    Start([Employee Submits Expense Claim]) --> ParsePrompt[Decompose Task & Extract Receipt]
    ParsePrompt --> ValidateReceipt{Valid Fields & No Injections?}
    ValidateReceipt -- No --> DenyReceipt[Gateway Returns DENY: Missing / Malformed]
    ValidateReceipt -- Yes --> CheckPolicies[Policy Engine Rule Evaluation]

    CheckPolicies --> PolCheck{Policy Evaluation Result}
    PolCheck -- Category Prohibited --> DenyPolicy[Gateway Returns DENY: POL-CAT-02]
    PolCheck -- Duplicate Detected --> DenyDup[Gateway Returns DENY: POL-DUP-04]
    PolCheck -- Over Threshold ₹5,000 --> RequireApproval[Gateway Returns REQUIRE_APPROVAL]
    PolCheck -- Clean & Under ₹5,000 --> AutoAllow[Gateway Returns ALLOW]

    RequireApproval --> ComputeHash[Compute Canonical SHA-256 Hash]
    ComputeHash --> PauseWorkflow[Pause Workflow & Create Pending Approval]
    PauseWorkflow --> ManagerReview{Manager Approves?}
    ManagerReview -- No --> BlockClaim[Claim Blocked & Task Failed]
    ManagerReview -- Yes --> RecheckHash{Payload Hash Intact?}

    RecheckHash -- Hash Tampered --> SecurityAlert[Invalidate Approval & Alert SecOps]
    RecheckHash -- Hash Verified --> AutoAllow

    AutoAllow --> DisburseTool[Allowlisted Claim Executor Disburses Funds]
    DisburseTool --> AuditRecord[Write Immutable Audit Log Record]
    AuditRecord --> Complete([Workflow Completed Successfully])
    DenyReceipt --> AuditRecord
    DenyPolicy --> AuditRecord
    DenyDup --> AuditRecord
    BlockClaim --> AuditRecord
    SecurityAlert --> AuditRecord
```

### Diagram 3: Governance Decision Flow
```mermaid
flowchart LR
    Proposal["Proposed Action Payload"] --> GatewayNode{"Governance Gateway"}
    GatewayNode --> P1["POL-SEC-05: Prompt Injection?"]
    P1 -- Detected --> D1["DENY (Security Violation)"]
    P1 -- Clean --> P2["POL-REC-01: Receipt Attached?"]
    P2 -- Missing --> D2["DENY (Mandatory Document)"]
    P2 -- Present --> P3["POL-CAT-02: Prohibited Category?"]
    P3 -- Personal/Gaming --> D3["DENY (Policy Violation)"]
    P3 -- Valid --> P4["POL-DUP-04: Duplicate Fingerprint?"]
    P4 -- Duplicate --> D4["DENY (Duplicate Claim)"]
    P4 -- Unique --> P5["POL-THR-03: Amount > ₹5,000?"]
    P5 -- Yes --> R1["REQUIRE_APPROVAL (Manager Required)"]
    P5 -- No --> A1["ALLOW (Auto-Approved)"]
```

### Diagram 4: MongoDB Collection Relationship Diagram (ERD)
```mermaid
erDiagram
    USERS ||--o{ EXPENSE_CLAIMS : submits
    USERS ||--o{ APPROVAL_REQUESTS : requests
    USERS ||--o{ APPROVAL_REQUESTS : resolves
    EXPENSE_CLAIMS ||--o| APPROVAL_REQUESTS : triggers
    EXPENSE_CLAIMS ||--o{ WORKFLOW_TASKS : executes
    WORKFLOW_TASKS ||--o{ AUDIT_LOGS : records
    POLICIES ||--o{ AUDIT_LOGS : governs

    USERS {
        string id PK
        string email
        string password_hash
        string name
        string role
        string department
        string status
        datetime created_at
    }

    EXPENSE_CLAIMS {
        string id PK
        string task_id FK
        string user_id FK
        string merchant
        float amount
        string currency
        string category
        string receipt_id
        string status
        string governance_decision
        string action_hash
        string idempotency_key
        datetime created_at
        datetime executed_at
    }

    APPROVAL_REQUESTS {
        string id PK
        string task_id FK
        string claim_id FK
        string requester_id FK
        string approver_id FK
        json proposed_action
        string action_hash
        string trigger_rule
        int risk_score
        string status
        bool consumed
        datetime created_at
        datetime expires_at
        datetime resolved_at
    }

    POLICIES {
        string id PK
        string policy_code
        string name
        string rule_type
        float threshold
        string currency
        bool active
        string version
        datetime updated_at
    }

    AUDIT_LOGS {
        string id PK
        string correlation_id
        datetime timestamp
        string actor
        string actor_type
        string action
        string resource
        string governance_decision
        json reason_codes
        string details
    }
```

### Diagram 5: UML Domain Model
```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String name
        +UserRole role
        +String department
        +Boolean hasPermission(action)
    }

    class PolicyEngine {
        +evaluate(proposedAction) Tuple~Verdict, Reasons, Violations~
        +listActivePolicies() List~Policy~
    }

    class RiskEngine {
        +calculateRisk(proposedAction, verdict) Tuple~Score, Level, Factors~
    }

    class GovernanceGateway {
        +evaluateProposal(proposedAction, user) Dict
        +verifyAndConsumeApproval(approvalId, user, action) Dict
    }

    class ClaimExecutorTool {
        +executeClaimDisbursement(claimId, idempotencyKey) Dict
    }

    class MultiAgentWorkflow {
        +executeTask(prompt, user, hints) TaskRecord
        +resumeTask(taskId) TaskRecord
    }

    GovernanceGateway --> PolicyEngine : invokes
    GovernanceGateway --> RiskEngine : scores
    GovernanceGateway --> ClaimExecutorTool : authorizes
    MultiAgentWorkflow --> GovernanceGateway : mediates
    User --> GovernanceGateway : authenticates
```

### Diagram 6: System Use-Case Diagram
```mermaid
flowchart LR
    Employee((Employee))
    Manager((Manager))
    Admin((Security Admin))

    subgraph AgentShield["AgentShield AI Platform"]
        UC1[Submit Expense via AI Prompt]
        UC2[Upload Receipt Document]
        UC3[View Own Claims & Status]
        UC4[Review Pending Governance Approvals]
        UC5[Approve / Reject Sensitive Action]
        UC6[Configure Spend Policies & Thresholds]
        UC7[Inspect Security Audit Trail]
        UC8[Trigger 50-Case Governance Benchmark]
    end

    Employee --> UC1
    Employee --> UC2
    Employee --> UC3

    Manager --> UC4
    Manager --> UC5
    Manager --> UC3

    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
```

### Diagram 7: Sequence Diagram for Approval & Resume
```mermaid
sequenceDiagram
    autonumber
    actor Emp as Employee
    participant UI as React Frontend
    participant Agent as ExecutionAgent
    participant GW as GovernanceGateway
    participant Pol as PolicyEngine
    participant DB as MongoDB Atlas
    actor Mgr as Manager
    participant Tool as ClaimExecutorTool

    Emp->>UI: Submit high-value claim (₹14,200)
    UI->>Agent: Run Multi-Agent Graph
    Agent->>GW: evaluate_proposal(ProposedAction)
    GW->>Pol: evaluate(ProposedAction)
    Pol-->>GW: REQUIRE_APPROVAL (POL-THR-03)
    GW->>GW: Compute Canonical SHA-256 Hash
    GW->>DB: Store Pending Approval bound to Hash
    GW-->>UI: Workflow Paused (WAITING_FOR_APPROVAL)

    Note over UI,Mgr: Out-of-band Manager Notification
    Mgr->>UI: View Pending Approvals Queue
    Mgr->>UI: Click "Approve Claim"
    UI->>GW: verify_and_consume_approval(appr_id, action="APPROVE")
    GW->>GW: Recompute SHA-256 Hash
    alt Hash Matches
        GW->>DB: Mark Approval CONSUMED & APPROVED
        GW->>Tool: execute_claim_disbursement(claim_id, idempotency_key)
        Tool->>DB: Update Claim to PROCESSED
        GW-->>UI: Resumption Success (ALLOW)
    else Hash Mismatch (Tampered In-Flight)
        GW->>DB: Invalidate Approval Token (INVALIDATED)
        GW-->>UI: 400 Bad Request: SECURITY_VIOLATION
    end
```

### Diagram 8: Component Diagram
```mermaid
flowchart TD
    subgraph FrontendApp["Frontend Application (React 19 + Tailwind v4)"]
        Router["React Router v7"]
        Views["Dashboard | Workspace | Claims | Approvals | Policies | Audit | Benchmark"]
        State["Client State & WebSockets"]
    end

    subgraph BackendAPI["Backend API Layer (FastAPI)"]
        AuthMiddleware["JWT Auth & RBAC Middleware"]
        REST["REST Routers (/auth, /agents, /claims, /approvals, /policies)"]
        WS["WebSocket Stream (/ws/tasks, /ws/agent-stream)"]
    end

    subgraph AgentCore["Agent & Workflow Engine"]
        Orchestrator["MultiAgentWorkflow Engine"]
        Agents["Planner | Receipt | Validation | Execution"]
        LLM["Google Gemini API / Provider Service"]
    end

    subgraph GovernanceModule["Governance & Compliance Module"]
        GatewayComponent["Governance Gateway"]
        PolicyComponent["Policy Engine (POL Rules)"]
        RiskComponent["Explainable Risk Scorer"]
        CryptoComponent["SHA-256 Action Hasher"]
    end

    subgraph StorageModule["Persistence & Tool Execution"]
        Repositories["PyMongo Repositories"]
        MongoAtlas["MongoDB Atlas Cluster"]
        Tools["Claim Executor with Idempotency"]
    end

    Views --> State
    State --> REST
    State --> WS
    REST --> AuthMiddleware
    AuthMiddleware --> Orchestrator
    Orchestrator --> Agents
    Agents --> LLM
    Agents --> GatewayComponent
    GatewayComponent --> PolicyComponent
    GatewayComponent --> RiskComponent
    GatewayComponent --> CryptoComponent
    GatewayComponent --> Tools
    Tools --> Repositories
    Repositories --> MongoAtlas
```

### Diagram 9: Deployment Diagram
```mermaid
flowchart TD
    subgraph ClientDevice["User Device (Chrome / Safari / Firefox)"]
        Browser["Single Page Application (SPA)"]
    end

    subgraph DockerHost["Docker Host / Cloud VM Environment"]
        subgraph WebContainer["agentshield-frontend Container"]
            Nginx["Nginx Reverse Proxy (Port 80 -> 3000)"]
        end

        subgraph APIContainer["agentshield-backend Container"]
            Uvicorn["Uvicorn ASGI Server (Port 8000)"]
            FastAPIApp["FastAPI Modular Monolith"]
        end

        subgraph DBContainer["agentshield-mongodb Container"]
            MongoLocal["MongoDB 6.0 Engine (Port 27017)"]
        end
    end

    subgraph ExternalCloud["External Cloud Services"]
        Atlas["MongoDB Atlas M0/M10 Managed Cluster"]
        GeminiCloud["Google Gemini AI Platform"]
    end

    Browser -->|HTTP/REST & WSS| Nginx
    Nginx -->|Proxy Pass /api/v1| Uvicorn
    Uvicorn --> FastAPIApp
    FastAPIApp -->|PyMongo Connection| Atlas
    FastAPIApp -.->|Local Dev Fallback| MongoLocal
    FastAPIApp -->|REST API Calls| GeminiCloud
```

### Diagram 10: Multi-Agent Workflow State Machine
```mermaid
stateDiagram-v2
    [*] --> PlannerState: User Submits Natural Language Request
    PlannerState --> ReceiptState: Structured Execution Plan
    ReceiptState --> ValidationState: Extracted Receipt Metadata
    ValidationState --> ExecutionProposal: Verified Data & Deduplication

    ExecutionProposal --> GovernanceEvaluation: ProposedAction + ActionHash

    state GovernanceEvaluation {
        [*] --> EvaluatingPolicies
        EvaluatingPolicies --> ScoringRisk
        ScoringRisk --> DecisionTernary
        DecisionTernary --> AllowState: Under Threshold & Clean
        DecisionTernary --> RequireApprovalState: Over Threshold (>₹5,000)
        DecisionTernary --> DenyState: Missing Doc / Prohibited / Duplicate
    }

    AllowState --> ToolDisbursement: Execute Allowlisted Tool
    ToolDisbursement --> TaskSucceeded: Status = SUCCEEDED
    TaskSucceeded --> [*]

    RequireApprovalState --> HumanInTheLoop: Status = WAITING_FOR_APPROVAL
    HumanInTheLoop --> ManagerRevalidation: Manager Review
    ManagerRevalidation --> ToolDisbursement: Manager Approved & Hash Verified
    ManagerRevalidation --> TaskFailed: Manager Rejected
    TaskFailed --> [*]

    DenyState --> TaskBlocked: Status = FAILED / BLOCKED
    TaskBlocked --> [*]
```
