"""
Machine Learning Subsystem for Job & Resume Document Parsing (Zero Cloud API).
Provides feature extraction, training pipelines, and local inference models.
"""
from .features import (
    extract_company_candidates,
    featurize_company_candidate,
    extract_role_candidates,
    featurize_role_candidate,
)
from .trainer import train_all_models, load_trained_models

__all__ = [
    "extract_company_candidates",
    "featurize_company_candidate",
    "extract_role_candidates",
    "featurize_role_candidate",
    "train_all_models",
    "load_trained_models",
]
