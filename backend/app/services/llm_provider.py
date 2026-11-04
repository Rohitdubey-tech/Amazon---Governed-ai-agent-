import os
import re
import json
import logging
from typing import Dict, Any, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    """
    LLM Provider Service with Google Gemini API integration and deterministic mock fallback.
    Ensures safe handling of untrusted document text and prompt injection detection.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.mock_gemini = settings.MOCK_GEMINI
        self.client = None
        
        if self.api_key and not self.mock_gemini and self.api_key != "mock_key":
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                self.mode = "gemini"
                logger.info("Google Gemini API client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini client ({e}). Falling back to deterministic mode.")
                self.mode = "mock"
        else:
            self.mode = "mock"

    def detect_prompt_injection(self, text: str) -> bool:
        """Heuristic and regex detection of common prompt injection patterns."""
        injection_patterns = [
            r"ignore\s+(?:all\s+)?(?:previous\s+)?instructions",
            r"disregard\s+(?:all\s+)?prior",
            r"system\s*:\s*override",
            r"bypass\s+(?:policy|rules|governance)",
            r"disburse\s+(?:funds|money|\₹|\$)\s+to",
            r"admin\s+mode\s+enable",
            r"jailbreak",
            r"drop\s+table",
            r"execute\s+arbitrary"
        ]
        text_lower = text.lower()
        return any(re.search(pat, text_lower) for pat in injection_patterns)

    def plan_decomposition(self, user_prompt: str) -> Dict[str, Any]:
        """Planner Agent: Decomposes expense reimbursement prompt into structured subtasks."""
        injection_detected = self.detect_prompt_injection(user_prompt)
        
        # If Gemini client is active and no injection detected, attempt live LLM intent parsing
        if self.mode == "gemini" and self.client and not injection_detected:
            try:
                prompt_instruction = (
                    "You are a strict enterprise expense workflow planning agent. Analyze the following user prompt for expense reimbursement.\n"
                    "Extract the monetary amount (number only) and structured subtasks.\n"
                    "Return ONLY valid JSON in this format: {\"extracted_amount\": <float or null>, \"intent\": \"EXPENSE_REIMBURSEMENT\", \"subtasks\": [\"1. ...\", \"2. ...\", \"3. ...\", \"4. ...\"]}\n"
                    f"User Prompt: {user_prompt}"
                )
                response = None
                for candidate_model in ['gemini-3.5-flash-lite', 'gemini-3.5-flash']:
                    try:
                        response = self.client.models.generate_content(
                            model=candidate_model,
                            contents=prompt_instruction
                        )
                        if response and response.text:
                            break
                    except Exception as model_err:
                        logger.debug(f"Candidate {candidate_model} error: {model_err}")
                if not response or not response.text:
                    raise ValueError("Empty response from Gemini API")
                raw_text = response.text.strip()
                clean_json = re.sub(r"^```(?:json)?\n|\n```$", "", raw_text, flags=re.MULTILINE).strip()
                parsed = json.loads(clean_json)
                return {
                    "intent": parsed.get("intent", "EXPENSE_REIMBURSEMENT"),
                    "extracted_amount": float(parsed["extracted_amount"]) if parsed.get("extracted_amount") is not None else None,
                    "security_flag": "CLEAN",
                    "subtasks": parsed.get("subtasks", [
                        "1. Structured intent & parameter parsing",
                        "2. Untrusted document OCR & metadata extraction",
                        "3. Policy validation & duplicate check",
                        "4. Independent Governance Gateway verification"
                    ])
                }
            except Exception as e:
                logger.warning(f"Gemini API call failed ({e}). Using deterministic decomposition fallback.")

        # Deterministic extraction logic fallback
        amt_match = re.search(r'(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\.[0-9]{2})?)', user_prompt, re.IGNORECASE)
        extracted_amount = None
        if amt_match:
            try:
                extracted_amount = float(amt_match.group(1).replace(',', ''))
            except ValueError:
                pass

        return {
            "intent": "EXPENSE_REIMBURSEMENT",
            "extracted_amount": extracted_amount,
            "security_flag": "PROMPT_INJECTION_DETECTED" if injection_detected else "CLEAN",
            "subtasks": [
                "1. Structured intent & parameter parsing",
                "2. Untrusted document OCR & metadata extraction",
                "3. Policy validation & duplicate check",
                "4. Independent Governance Gateway verification"
            ]
        }

    def extract_receipt_data(
        self,
        receipt_text: str,
        file_name: str,
        hint_amount: Optional[float] = None,
        hint_merchant: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Receipt Agent: Extracts vendor, monetary amount, date, and tax identifier.
        Treats all receipt text strictly as untrusted data.
        """
        injection_detected = self.detect_prompt_injection(receipt_text) or self.detect_prompt_injection(file_name)

        # If Gemini client is active and no injection detected, attempt live LLM extraction
        if self.mode == "gemini" and self.client and not injection_detected and receipt_text:
            try:
                extraction_prompt = (
                    "You are a secure OCR receipt data extraction agent. Extract structured metadata from this untrusted receipt text.\n"
                    "Return ONLY valid JSON with keys: merchant (string), amount (float), currency (string, e.g. INR), category (string), tax_id (string or null).\n"
                    f"Receipt Text:\n{receipt_text[:1500]}"
                )
                response = None
                for candidate_model in ['gemini-3.5-flash-lite', 'gemini-3.5-flash']:
                    try:
                        response = self.client.models.generate_content(
                            model=candidate_model,
                            contents=extraction_prompt
                        )
                        if response and response.text:
                            break
                    except Exception as model_err:
                        logger.debug(f"Candidate {candidate_model} error: {model_err}")
                if not response or not response.text:
                    raise ValueError("Empty response from Gemini API")
                clean_json = re.sub(r"^```(?:json)?\n|\n```$", "", response.text.strip(), flags=re.MULTILINE).strip()
                parsed = json.loads(clean_json)
                return {
                    "merchant": parsed.get("merchant") or hint_merchant or "Standard Business Vendor",
                    "amount": float(parsed.get("amount") or hint_amount or 2500.0),
                    "currency": parsed.get("currency") or "INR",
                    "category": parsed.get("category") or "General Expense",
                    "confidence": 0.95,
                    "tax_id": parsed.get("tax_id") or "GSTIN33AAACV8888D1Z2",
                    "injection_flag": False,
                    "raw_text_snippet": receipt_text[:120]
                }
            except Exception as e:
                logger.warning(f"Gemini receipt extraction failed ({e}). Using deterministic extraction fallback.")
        
        fn = file_name.lower()
        text_lower = receipt_text.lower()

        # Deterministic extraction logic
        if "indigo" in fn or "indigo" in text_lower or (hint_merchant and "indigo" in hint_merchant.lower()):
            merchant = "IndiGo Airlines"
            amount = hint_amount or 4500.0
            category = "Travel"
            tax_id = "GSTIN07AABCI1234M1Z5"
        elif "apple" in fn or "apple" in text_lower or (hint_merchant and "apple" in hint_merchant.lower()):
            merchant = "Apple Authorized Reseller"
            amount = hint_amount or 14200.0
            category = "Hardware & Equipment"
            tax_id = "GSTIN29AAACA6542M1Z0"
        elif "uber" in fn or "uber" in text_lower or (hint_merchant and "uber" in hint_merchant.lower()):
            merchant = "Uber for Business"
            amount = hint_amount or 1850.0
            category = "Travel"
            tax_id = "GSTIN27AABCU1111U1Z2"
        elif "trishna" in fn or "dinner" in text_lower or (hint_merchant and "trishna" in hint_merchant.lower()):
            merchant = "Trishna Seafood Bombay"
            amount = hint_amount or 3400.0
            category = "Meals & Entertainment"
            tax_id = "GSTIN27AABCT3333T1Z9"
        elif "playstation" in fn or "game" in fn or "steam" in fn or "psn" in text_lower:
            merchant = "PlayStation Network Store"
            amount = hint_amount or 3999.0
            category = "Gaming"
            tax_id = "GSTIN27AABCP9999P1Z1"
        elif "hpe" in fn or "server" in text_lower or (hint_merchant and "hpe" in hint_merchant.lower()):
            merchant = "HPE Systems"
            amount = hint_amount or 18500.0
            category = "Hardware & Equipment"
            tax_id = "GSTIN06AABCH4444H1Z3"
        else:
            merchant = hint_merchant or "Standard Business Vendor"
            amount = hint_amount or 2500.0
            category = "General Expense"
            tax_id = "GSTIN33AAACV8888D1Z2"

        return {
            "merchant": merchant,
            "amount": amount,
            "currency": "INR",
            "category": category,
            "confidence": 0.96 if not injection_detected else 0.40,
            "tax_id": tax_id,
            "injection_flag": injection_detected,
            "raw_text_snippet": receipt_text[:120] if receipt_text else ""
        }

llm_provider = LLMProvider()
