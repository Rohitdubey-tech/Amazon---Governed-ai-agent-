import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from backend.app.agents.specialist_agents import planner_agent, receipt_agent, validation_agent, execution_agent
from backend.app.database.repositories.task_repo import task_repo
from backend.app.database.repositories.claim_repo import claim_repo

class MultiAgentWorkflow:
    def execute_task(
        self,
        prompt: str,
        user: Dict[str, Any],
        receipt_name: str = "expense_receipt.pdf",
        amount_hint: float = None,
        merchant_hint: str = None,
        category_hint: str = None
    ) -> Dict[str, Any]:
        task_id = f"tsk_{uuid.uuid4().hex[:6]}"
        claim_id = f"clm_{uuid.uuid4().hex[:6]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Step 1: Planner Agent
        plan_out = planner_agent.run(prompt, user)

        # Step 2: Receipt Agent
        extracted = receipt_agent.run(
            receipt_name=receipt_name,
            hint_amount=amount_hint or plan_out.get("extracted_amount"),
            hint_merchant=merchant_hint
        )
        extracted["receipt_name"] = receipt_name
        if category_hint:
            extracted["category"] = category_hint

        # Step 3: Validation Agent
        val_out = validation_agent.run(extracted)

        # Create Draft Claim Record in database
        initial_claim = {
            "id": claim_id,
            "task_id": task_id,
            "user_id": user.get("id"),
            "user_name": user.get("name"),
            "user_email": user.get("email"),
            "merchant": extracted["merchant"],
            "amount": extracted["amount"],
            "currency": extracted.get("currency", "INR"),
            "category": extracted.get("category", "General"),
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "receipt_id": f"rcpt_{uuid.uuid4().hex[:6]}",
            "receipt_name": receipt_name,
            "status": "DRAFT",
            "governance_decision": "PENDING",
            "approval_id": None,
            "risk_score": 15,
            "risk_level": "LOW",
            "block_reason": None,
            "action_hash": None,
            "created_at": now_iso,
            "executed_at": None
        }
        claim_repo.create(initial_claim)

        # Step 4: Execution Agent + Governance Gateway
        exec_out = execution_agent.run(
            task_id=task_id,
            claim_id=claim_id,
            extracted_data=extracted,
            user=user
        )

        decision_data = exec_out["decision"]
        verdict = decision_data["verdict"]

        if verdict == "ALLOW":
            task_status = "SUCCEEDED"
            claim_status = "PROCESSED"
            step4_desc = "Governance Gateway returned ALLOW: Simulated tool executed successfully."
            step4_status = "COMPLETED"
            completed_at = datetime.now(timezone.utc).isoformat()
        elif verdict == "REQUIRE_APPROVAL":
            task_status = "WAITING_FOR_APPROVAL"
            claim_status = "WAITING_FOR_APPROVAL"
            step4_desc = f"Governance Gateway returned REQUIRE_APPROVAL: Paused for Manager review. Bound to action hash."
            step4_status = "PAUSED"
            completed_at = None
        else: # DENY
            task_status = "FAILED"
            claim_status = "BLOCKED"
            step4_desc = f"Governance Gateway returned DENY: {decision_data['violations'][0] if decision_data['violations'] else 'Violates policy'}"
            step4_status = "BLOCKED"
            completed_at = None

        # Update claim record with final verdict
        claim_repo.update_claim(claim_id, {
            "status": claim_status,
            "governance_decision": verdict,
            "approval_id": decision_data.get("approval_id"),
            "risk_score": decision_data["risk_score"],
            "risk_level": decision_data["risk_level"],
            "block_reason": decision_data["violations"][0] if decision_data["violations"] else None,
            "action_hash": decision_data["action_hash"]
        })

        # Assemble full 4-Agent Plan
        plan_steps = [
            {
                "step": 1,
                "agent": "Planner Agent",
                "desc": f"Decompose task '{prompt[:45]}...' into structured multi-agent graph execution",
                "status": "COMPLETED",
                "output": plan_out
            },
            {
                "step": 2,
                "agent": "Receipt Agent",
                "desc": f"OCR extraction: Merchant={extracted['merchant']}, Amount=₹{extracted['amount']:,.2f}, Category={extracted['category']}",
                "status": "COMPLETED",
                "output": extracted
            },
            {
                "step": 3,
                "agent": "Validation Agent",
                "desc": "Verify data integrity, check duplicate fingerprints, and assert required fields",
                "status": "COMPLETED" if val_out["valid"] else "FLAGGED",
                "output": val_out
            },
            {
                "step": 4,
                "agent": "Execution Agent",
                "desc": step4_desc,
                "status": step4_status,
                "output": {
                    "verdict": verdict,
                    "action_hash": decision_data["action_hash"],
                    "approval_id": decision_data.get("approval_id")
                }
            }
        ]

        task_record = {
            "id": task_id,
            "user_id": user.get("id"),
            "user_name": user.get("name"),
            "prompt": prompt,
            "receipt_name": receipt_name,
            "status": task_status,
            "plan": plan_steps,
            "governance_decision": verdict,
            "claim_id": claim_id,
            "approval_id": decision_data.get("approval_id"),
            "action_hash": decision_data["action_hash"],
            "risk_score": decision_data["risk_score"],
            "risk_level": decision_data["risk_level"],
            "risk_factors": decision_data["risk_factors"],
            "created_at": now_iso,
            "completed_at": completed_at
        }
        task_repo.create(task_record)

        return task_record

workflow_orchestrator = MultiAgentWorkflow()

