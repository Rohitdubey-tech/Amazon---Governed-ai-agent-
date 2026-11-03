import json
import hashlib
from typing import Any, Dict

def canonicalize(obj: Any) -> Any:
    """Recursively sort dictionary keys to create deterministic canonical JSON."""
    if isinstance(obj, dict):
        return {k: canonicalize(v) for k, v in sorted(obj.items())}
    if isinstance(obj, list):
        return [canonicalize(item) for item in obj]
    return obj

def compute_action_hash(action_dict: Dict[str, Any]) -> str:
    """Compute SHA-256 hash of canonicalized action parameters."""
    canonical_obj = canonicalize(action_dict)
    canonical_json = json.dumps(canonical_obj, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

