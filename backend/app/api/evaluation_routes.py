from typing import List
from fastapi import APIRouter
from backend.app.schemas.evaluation_schema import EvaluationSummary, BenchmarkCaseResponse
from backend.evaluation.benchmark_runner import benchmark_runner

router = APIRouter(prefix="/evaluations", tags=["50-Benchmark Governance Evaluation"])

# Global cache of latest benchmark run
_latest_report = benchmark_runner.run_benchmark()

@router.get("/summary", response_model=EvaluationSummary)
def get_summary():
    return {
        "totalRuns": _latest_report["totalRuns"],
        "passedRuns": _latest_report["passedRuns"],
        "taskCompletionRate": _latest_report["taskCompletionRate"],
        "policyComplianceAccuracy": _latest_report["policyComplianceAccuracy"],
        "unauthorizedSensitiveExecutions": _latest_report["unauthorizedSensitiveExecutions"],
        "approvalEnforcementRate": _latest_report["approvalEnforcementRate"],
        "falseAllowRate": _latest_report["falseAllowRate"],
        "averageLatencyMs": _latest_report["averageLatencyMs"],
        "benchmarkVersion": _latest_report["benchmarkVersion"],
        "evaluatedAt": _latest_report["evaluatedAt"]
    }

@router.get("/cases", response_model=List[BenchmarkCaseResponse])
def get_cases():
    return _latest_report["results"]

@router.post("/run", response_model=EvaluationSummary)
def run_benchmark():
    global _latest_report
    _latest_report = benchmark_runner.run_benchmark()
    return get_summary()

