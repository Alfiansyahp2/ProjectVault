import os
from typing import Dict, Any, Optional
import numpy as np

from ..ml.trainer import load_trained_models, MODEL_CACHE_PATH
from ..ml.features import (
    extract_company_candidates,
    featurize_company_candidate,
    extract_role_candidates,
    featurize_role_candidate,
)

_CACHED_BUNDLE: Optional[Dict[str, Any]] = None

def get_bundle() -> Optional[Dict[str, Any]]:
    """Get or lazily load the cached model bundle."""
    global _CACHED_BUNDLE
    if _CACHED_BUNDLE is None and os.path.exists(MODEL_CACHE_PATH):
        _CACHED_BUNDLE = load_trained_models()
    return _CACHED_BUNDLE

def reload_models() -> bool:
    """Force reload the model bundle from disk."""
    global _CACHED_BUNDLE
    _CACHED_BUNDLE = load_trained_models()
    return bool(_CACHED_BUNDLE)

def get_model_status() -> Dict[str, Any]:
    """Return model status, training timestamp, and evaluation metrics."""
    bundle = get_bundle()
    if not bundle or "metadata" not in bundle:
        return {
            "is_trained": False,
            "status": "Model belum dilatih",
            "metrics": None
        }

    meta = bundle["metadata"]
    return {
        "is_trained": True,
        "status": "Model ML Aktif & Siap Pakai",
        "trained_at": meta.get("trained_at"),
        "sample_count": meta.get("sample_count"),
        "metrics": meta.get("metrics")
    }

def predict_with_ml(text: str, filename: str = "") -> Dict[str, Any]:
    """Execute local ML inference on document text for job title, company, and portal."""
    bundle = get_bundle()
    if not bundle or "portal_pipeline" not in bundle:
        return {"ml_available": False}

    result = {
        "ml_available": True,
        "company_name": None,
        "company_confidence": 0.0,
        "job_title": None,
        "job_title_confidence": 0.0,
        "source_portal": None,
        "portal_confidence": 0.0
    }

    try:
        # 1. Source Portal Prediction
        portal_pipe = bundle.get("portal_pipeline")
        if portal_pipe:
            portal_probs = portal_pipe.predict_proba([text])[0]
            max_p_idx = int(np.argmax(portal_probs))
            result["source_portal"] = str(portal_pipe.classes_[max_p_idx])
            result["portal_confidence"] = round(float(portal_probs[max_p_idx]), 4)

        # 2. Company Name Candidate Ranking
        company_ranker = bundle.get("company_ranker")
        if company_ranker:
            cands = extract_company_candidates(text, filename)
            if cands:
                feat_matrix = np.array([featurize_company_candidate(c, text, filename) for c in cands])
                co_probs = company_ranker.predict_proba(feat_matrix)[:, 1]
                best_idx = int(np.argmax(co_probs))
                result["company_name"] = cands[best_idx]
                result["company_confidence"] = round(float(co_probs[best_idx]), 4)

        # 3. Job Title Candidate Ranking
        role_ranker = bundle.get("role_ranker")
        if role_ranker:
            role_cands = extract_role_candidates(text)
            if role_cands:
                feat_matrix = np.array([featurize_role_candidate(c, text) for c in role_cands])
                role_probs = role_ranker.predict_proba(feat_matrix)[:, 1]
                best_role_idx = int(np.argmax(role_probs))
                result["job_title"] = role_cands[best_role_idx]
                result["job_title_confidence"] = round(float(role_probs[best_role_idx]), 4)

    except Exception as e:
        print(f"Warning: ML prediction error: {e}")
        return {"ml_available": False, "error": str(e)}

    return result
