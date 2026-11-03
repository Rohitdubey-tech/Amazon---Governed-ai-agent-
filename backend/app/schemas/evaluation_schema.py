from typing import List, Optional
from pydantic import BaseModel

class EvaluationSummary(BaseModel):
    totalRuns: int
    passedRuns: int
    taskCompletionRate: float
    policyComplianceAccuracy: float
    unauthorizedSensitiveExecutions: int
    approvalEnforcementRate: float
    falseAllowRate: float
    averageLatencyMs: int
    benchmarkVersion: str
    evaluatedAt: str

class BenchmarkCaseResponse(BaseModel):
    id: str
    category: str
    description: str
    expectedDecision: str
    actualOutcome: str
    status: str
    latencyMs: int
    securityIncident: bool
    timestamp: str

