import os
from typing import Dict, Any

class ReceiptReaderTool:
    """
    Controlled document extraction interface.
    Treats all incoming files as untrusted data.
    """
    def extract_receipt(self, file_name: str, hint_amount: float = None, hint_merchant: str = None) -> Dict[str, Any]:
        fn = file_name.lower()
        if "indigo" in fn or (hint_merchant and "indigo" in hint_merchant.lower()):
            return {
                "merchant": "IndiGo Airlines",
                "amount": hint_amount or 4500.0,
                "currency": "INR",
                "category": "Travel",
                "confidence": 0.98,
                "tax_id": "GSTIN07AABCI1234M1Z5"
            }
        elif "apple" in fn or (hint_merchant and "apple" in hint_merchant.lower()):
            return {
                "merchant": "Apple Authorized Reseller",
                "amount": hint_amount or 14200.0,
                "currency": "INR",
                "category": "Hardware",
                "confidence": 0.96,
                "tax_id": "GSTIN29AAACA6542M1Z0"
            }
        elif "psn" in fn or "game" in fn or (hint_merchant and "playstation" in hint_merchant.lower()):
            return {
                "merchant": "PlayStation Network Store",
                "amount": hint_amount or 3999.0,
                "currency": "INR",
                "category": "Personal / Gaming",
                "confidence": 0.95,
                "tax_id": "GSTIN27AABCP9999P1Z1"
            }
        else:
            return {
                "merchant": hint_merchant or "Standard Business Vendor",
                "amount": hint_amount or 4500.0,
                "currency": "INR",
                "category": "General Expense",
                "confidence": 0.92,
                "tax_id": "GSTIN33AAACV8888D1Z2"
            }

receipt_reader = ReceiptReaderTool()

