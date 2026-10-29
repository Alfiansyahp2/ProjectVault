import os
from typing import Dict, Any, Optional

try:
    import numpy as np
    from ..ml.trainer import load_trained_models, MODEL_CACHE_PATH
    from ..ml.features import (
        extract_company_candidates,
        featurize_company_candidate,
        extract_role_candidates,
        featurize_role_candidate,
    )
    HAS_ML_DEPS = True
except Exception:
    HAS_ML_DEPS = False
    MODEL_CACHE_PATH = ""
    def load_trained_models():
        return {}

_CACHED_BUNDLE: Optional[Dict[str, Any]] = None

def get_bundle() -> Optional[Dict[str, Any]]:
    """Get or lazily load the cached model bundle."""
    global _CACHED_BUNDLE
    if _CACHED_BUNDLE is None and HAS_ML_DEPS and MODEL_CACHE_PATH and os.path.exists(MODEL_CACHE_PATH):
        _CACHED_BUNDLE = load_trained_models()
    return _CACHED_BUNDLE

def reload_models() -> bool:
    """Force reload the model bundle from disk."""
    global _CACHED_BUNDLE
    if not HAS_ML_DEPS:
        return False
    loaded = load_trained_models()
    if loaded:
        _CACHED_BUNDLE = loaded
        return True
    return False

def get_model_status() -> Dict[str, Any]:
    """Return model status, training timestamp, and evaluation metrics."""
    if not HAS_ML_DEPS:
        return {
            "is_trained": False,
            "status": "Dependensi ML tidak terpasang di runtime",
            "metrics": None
        }

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
    if not HAS_ML_DEPS or not text or len(text.strip()) < 10:
        return {"ml_available": False}

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
                probs = company_ranker.predict_proba(feat_matrix)
                co_probs = probs[:, 1] if probs.shape[1] > 1 else probs[:, 0]
                best_idx = int(np.argmax(co_probs))
                result["company_name"] = cands[best_idx]
                result["company_confidence"] = round(float(co_probs[best_idx]), 4)

        # 3. Job Title Candidate Ranking
        role_ranker = bundle.get("role_ranker")
        if role_ranker:
            role_cands = extract_role_candidates(text)
            if role_cands:
                feat_matrix = np.array([featurize_role_candidate(c, text) for c in role_cands])
                probs = role_ranker.predict_proba(feat_matrix)
                role_probs = probs[:, 1] if probs.shape[1] > 1 else probs[:, 0]
                best_role_idx = int(np.argmax(role_probs))
                result["job_title"] = role_cands[best_role_idx]
                result["job_title_confidence"] = round(float(role_probs[best_role_idx]), 4)

    except Exception as e:
        print(f"Warning: ML prediction error: {e}")
        return {"ml_available": False, "error": str(e)}

    return result
