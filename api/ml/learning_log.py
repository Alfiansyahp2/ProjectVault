import os
import json
import hashlib
import datetime
from typing import Dict, Any, List, Optional

try:
    from ..config import LEARNING_LOG_PATH, atomic_write_json
except ImportError:
    from api.config import LEARNING_LOG_PATH, atomic_write_json

def compute_text_hash(text: str) -> str:
    """Generate a short hash for deduplicating parsed texts."""
    clean = " ".join(text.lower().split()[:60])
    return hashlib.md5(clean.encode("utf-8")).hexdigest()[:12]

def record_parse_event(
    raw_text: str,
    result: Dict[str, Any],
    source_hint: str = "",
    is_verified: bool = False,
    source: str = "auto_parse"
) -> Optional[Dict[str, Any]]:
    """Log a parsing execution into the learning store so the model can continuously learn from it."""
    if not raw_text or len(raw_text.strip()) < 20:
        return None

    company = result.get("company_name", "").strip()
    job_title = result.get("job_title", "").strip()

    # Skip logging if both are completely empty
    if not company and not job_title:
        return None

    sample_id = f"log_{compute_text_hash(raw_text)}"
    timestamp = datetime.datetime.now().isoformat()

    log_entry = {
        "id": sample_id,
        "timestamp": timestamp,
        "file_name": source_hint or result.get("file_name", "Teks Salinan"),
        "company_name": company,
        "job_title": job_title,
        "source_portal": result.get("source_portal", "Direct / Other"),
        "key_skills": result.get("key_skills", []),
        "location": result.get("location"),
        "salary_range": result.get("salary_range"),
        "job_type": result.get("job_type"),
        "cover_letter": raw_text.strip()[:8000],
        "is_verified": is_verified,
        "source": source,
        "ml_meta": result.get("ml_meta", {})
    }

    existing_logs: List[Dict[str, Any]] = []
    if os.path.exists(LEARNING_LOG_PATH):
        try:
            with open(LEARNING_LOG_PATH, "r", encoding="utf-8") as f:
                existing_logs = json.load(f)
        except Exception:
            existing_logs = []

    # Update if ID exists, or append
    updated = False
    for i, item in enumerate(existing_logs):
        if item.get("id") == sample_id:
            # If newly verified or has better values, overwrite
            if is_verified or not item.get("is_verified"):
                existing_logs[i] = log_entry
            updated = True
            break

    if not updated:
        existing_logs.append(log_entry)

    # Keep file size reasonable (max 1000 logged items)
    if len(existing_logs) > 1000:
        existing_logs = existing_logs[-1000:]

    try:
        atomic_write_json(LEARNING_LOG_PATH, existing_logs)
    except Exception as e:
        print(f"Warning: Failed to save parser learning log: {e}")

    return log_entry

def get_learning_logs(limit: int = 50) -> Dict[str, Any]:
    """Retrieve learning log statistics and the most recent logged parse results."""
    if not os.path.exists(LEARNING_LOG_PATH):
        return {
            "total_logged": 0,
            "verified_count": 0,
            "recent_logs": []
        }

    try:
        with open(LEARNING_LOG_PATH, "r", encoding="utf-8") as f:
            logs: List[Dict[str, Any]] = json.load(f)
    except Exception:
        logs = []

    verified_count = sum(1 for item in logs if item.get("is_verified"))
    recent = list(reversed(logs))[:limit]

    return {
        "total_logged": len(logs),
        "verified_count": verified_count,
        "recent_logs": recent
    }

def get_valid_training_samples_from_log() -> List[Dict[str, Any]]:
    """Return samples from learning log suitable for model retraining."""
    if not os.path.exists(LEARNING_LOG_PATH):
        return []

    try:
        with open(LEARNING_LOG_PATH, "r", encoding="utf-8") as f:
            logs: List[Dict[str, Any]] = json.load(f)
    except Exception:
        return []

    valid = []
    for item in logs:
        co = item.get("company_name", "").strip()
        role = item.get("job_title", "").strip()
        text = item.get("cover_letter", "").strip()
        # Must have text and valid non-placeholder values
        if text and co and role and co not in ["Perusahaan", "Perusahaan (Formulir Lowongan)", "Unknown"]:
            valid.append(item)
    return valid
