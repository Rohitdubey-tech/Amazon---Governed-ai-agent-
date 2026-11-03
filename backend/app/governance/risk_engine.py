from typing import Dict, Any, Tuple, List

class RiskEngine:
    """
    Explainable Risk Engine.
    Scores proposed actions between 0 and 100 based on quantifiable risk factors.
    """
    def calculate_risk(
        self,
        proposed_action: Dict[str, Any],
        verdict: str,
        violations: List[str]
    ) -> Tuple[int, str, List[str]]:
        amount = float(proposed_action.get("amount", 0))
        category = str(proposed_action.get("category", ""))
        
        score = 15
        factors = []

        if verdict == "DENY":
            score = 92
            factors.extend(violations)
            return score, "HIGH", factors

        if amount > 10000:
            score += 45
            factors.append(f"High monetary exposure (₹{amount:,.2f} INR)")
        elif amount > 5000:
            score += 35
            factors.append(f"Exceeds standard ₹5,000 baseline threshold (₹{amount:,.2f} INR)")
        else:
            factors.append("Monetary amount within standard low-risk threshold")

        if category.lower() in ("hardware", "electronics", "capital expenditure"):
            score += 15
            factors.append("Asset tracking category with high secondary depreciation")

        score = min(score, 100)
        level = "LOW" if score < 35 else "MEDIUM" if score < 75 else "HIGH"

        return score, level, factors

risk_engine = RiskEngine()

