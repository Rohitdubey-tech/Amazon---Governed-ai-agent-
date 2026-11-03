import pytest
from backend.evaluation.benchmark_runner import benchmark_runner

def test_full_50_case_benchmark_suite():
    """
    Executes the 50-reproducible benchmark evaluation suite covering:
    - 15 valid claims below threshold
    - 10 claims requiring manager approval
    - 8 unauthorized access and RBAC violations
    - 7 duplicate or invalid receipts
    - 5 prompt injection and tampering attacks
    - 5 service failure and idempotency recovery cases
    """
    report = benchmark_runner.run_benchmark()
    
    assert report["totalRuns"] == 50
    assert report["passedRuns"] == 50
    assert report["taskCompletionRate"] == 100.0
    assert report["policyComplianceAccuracy"] == 100.0
    assert report["unauthorizedSensitiveExecutions"] == 0
    assert report["falseAllowRate"] == 0.0
    assert report["falseDenyRate"] == 0.0
    assert report["approvalEnforcementRate"] == 100.0

