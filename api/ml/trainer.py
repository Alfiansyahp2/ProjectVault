import os
import json
import datetime
from typing import Dict, Any, List
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score

from .features import (
    extract_company_candidates,
    featurize_company_candidate,
    extract_role_candidates,
    featurize_role_candidate,
)
from .learning_log import get_valid_training_samples_from_log

try:
    from ..config import PARSED_APPLICATIONS_PATH, FEEDBACK_DATA_PATH, MODEL_CACHE_PATH
except ImportError:
    from api.config import PARSED_APPLICATIONS_PATH, FEEDBACK_DATA_PATH, MODEL_CACHE_PATH

DEFAULT_DATA_PATH = PARSED_APPLICATIONS_PATH

def load_training_dataset(data_path: str = DEFAULT_DATA_PATH) -> List[Dict[str, Any]]:
    """Load primary applications dataset, user feedback, and parser learning logs."""
    dataset = []
    if os.path.exists(data_path):
        with open(data_path, "r", encoding="utf-8") as f:
            dataset.extend(json.load(f))

    if os.path.exists(FEEDBACK_DATA_PATH):
        try:
            with open(FEEDBACK_DATA_PATH, "r", encoding="utf-8") as f:
                dataset.extend(json.load(f))
        except Exception:
            pass

    # Append continuous training samples from persistent learning log
    dataset.extend(get_valid_training_samples_from_log())

    # Deduplicate by company, role, and text signature
    seen, deduped = set(), []
    for d in dataset:
        co = d.get("company_name", "").strip().lower()
        role = d.get("job_title", "").strip().lower()
        text = d.get("cover_letter", "").strip()
        if not text or not co or not role:
            continue
        key = (co, role, text[:80].lower())
        if key not in seen:
            seen.add(key)
            deduped.append(d)

    return deduped

def train_all_models(data_path: str = DEFAULT_DATA_PATH) -> Dict[str, Any]:
    """Train Job Title, Portal, and Company Ranking models with strict ML validation."""
    data = load_training_dataset(data_path)
    if len(data) < 10:
        raise ValueError(f"Insufficient training samples ({len(data)}). Minimum 10 samples required.")

    train_data, test_data = train_test_split(data, test_size=0.2, random_state=42)

    # 1. Source Portal Classifier Pipeline
    X_train_text = [d["cover_letter"] for d in train_data]
    y_train_portal = [d.get("source_portal", "Direct / Other") for d in train_data]
    X_test_text = [d["cover_letter"] for d in test_data]
    y_test_portal = [d.get("source_portal", "Direct / Other") for d in test_data]

    portal_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=2500)),
        ('clf', MultinomialNB(alpha=0.5))
    ])
    portal_pipeline.fit(X_train_text, y_train_portal)
    y_pred_portal = portal_pipeline.predict(X_test_text)
    portal_acc = float(accuracy_score(y_test_portal, y_pred_portal))
    portal_f1 = float(f1_score(y_test_portal, y_pred_portal, average='weighted', zero_division=0))

    # 2. Company Name Candidate Ranker
    X_train_co, y_train_co = [], []
    for d in train_data:
        text, fn, true_co = d["cover_letter"], d.get("file_name", ""), d["company_name"].lower().strip()
        cands = extract_company_candidates(text, fn)
        if true_co and not any(true_co in c.lower() for c in cands):
            cands.append(d["company_name"])
        for cand in cands:
            X_train_co.append(featurize_company_candidate(cand, text, fn))
            y_train_co.append(1 if (cand.lower().strip() in true_co or true_co in cand.lower().strip()) else 0)

    if len(set(y_train_co)) < 2:
        X_train_co.extend([[0.0] * 10, [1.0] * 10])
        y_train_co.extend([0, 1])

    company_ranker = LogisticRegression(class_weight='balanced', max_iter=500, random_state=42)
    company_ranker.fit(np.array(X_train_co), np.array(y_train_co))

    co_correct = 0
    for d in test_data:
        text, fn, true_co = d["cover_letter"], d.get("file_name", ""), d["company_name"].lower().strip()
        cands = extract_company_candidates(text, fn)
        if not cands: continue
        feat_matrix = np.array([featurize_company_candidate(c, text, fn) for c in cands])
        co_probs = company_ranker.predict_proba(feat_matrix)
        scores = co_probs[:, 1] if co_probs.shape[1] > 1 else co_probs[:, 0]
        best = cands[int(np.argmax(scores))].lower()
        if best in true_co or true_co in best:
            co_correct += 1
    company_acc = float(co_correct / max(len(test_data), 1))

    # 3. Job Title Candidate Ranker
    X_train_role, y_train_role = [], []
    for d in train_data:
        text, true_role = d["cover_letter"], d["job_title"].lower().strip()
        cands = extract_role_candidates(text)
        if true_role and not any(true_role in c.lower() for c in cands):
            cands.append(d["job_title"])
        for cand in cands:
            X_train_role.append(featurize_role_candidate(cand, text))
            y_train_role.append(1 if (cand.lower().strip() in true_role or true_role in cand.lower().strip()) else 0)

    if len(set(y_train_role)) < 2:
        X_train_role.extend([[0.0] * 7, [1.0] * 7])
        y_train_role.extend([0, 1])

    role_ranker = LogisticRegression(class_weight='balanced', max_iter=500, random_state=42)
    role_ranker.fit(np.array(X_train_role), np.array(y_train_role))

    role_correct = 0
    for d in test_data:
        text, true_role = d["cover_letter"], d["job_title"].lower().strip()
        cands = extract_role_candidates(text)
        if not cands: continue
        feat_matrix = np.array([featurize_role_candidate(c, text) for c in cands])
        role_probs = role_ranker.predict_proba(feat_matrix)
        scores = role_probs[:, 1] if role_probs.shape[1] > 1 else role_probs[:, 0]
        best = cands[int(np.argmax(scores))].lower()
        if best in true_role or true_role in best:
            role_correct += 1
    role_acc = float(role_correct / max(len(test_data), 1))

    # Model artifact bundle
    bundle = {
        "portal_pipeline": portal_pipeline,
        "company_ranker": company_ranker,
        "role_ranker": role_ranker,
        "metadata": {
            "trained_at": datetime.datetime.now().isoformat(),
            "sample_count": len(data),
            "train_samples": len(train_data),
            "test_samples": len(test_data),
            "metrics": {
                "job_title_accuracy": round(role_acc, 4),
                "portal_accuracy": round(portal_acc, 4),
                "portal_f1": round(portal_f1, 4),
                "company_top1_accuracy": round(company_acc, 4),
                "overall_accuracy": round((role_acc + portal_acc + company_acc) / 3.0, 4)
            }
        }
    }

    os.makedirs(os.path.dirname(MODEL_CACHE_PATH), exist_ok=True)
    tmp_path = f"{MODEL_CACHE_PATH}.tmp.{os.getpid()}"
    try:
        joblib.dump(bundle, tmp_path)
        os.replace(tmp_path, MODEL_CACHE_PATH)
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
    return bundle["metadata"]

def load_trained_models() -> Dict[str, Any]:
    """Load serialized model bundle from cache."""
    if not os.path.exists(MODEL_CACHE_PATH):
        return {}
    try:
        return joblib.load(MODEL_CACHE_PATH)
    except Exception as e:
        print(f"Warning: Failed to load ML parser models: {e}")
        return {}
