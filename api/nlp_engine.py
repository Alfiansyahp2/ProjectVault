"""
Backwards-compatible wrapper for Local NLP Document Intelligence Engine.
Directs all core logic to api.services.nlp_engine.
"""

try:
    from api.services.nlp_engine import (
        clean_extracted_text,
        extract_date,
        extract_portal,
        clean_company_name,
        extract_company,
        clean_job_title,
        extract_job_title,
        extract_skills,
        generate_extractive_summary,
        parse_raw_text,
        parse_pdf_document,
        scan_all_resumes,
    )
except ImportError:
    from services.nlp_engine import (
        clean_extracted_text,
        extract_date,
        extract_portal,
        clean_company_name,
        extract_company,
        clean_job_title,
        extract_job_title,
        extract_skills,
        generate_extractive_summary,
        parse_raw_text,
        parse_pdf_document,
        scan_all_resumes,
    )

__all__ = [
    "clean_extracted_text",
    "extract_date",
    "extract_portal",
    "clean_company_name",
    "extract_company",
    "clean_job_title",
    "extract_job_title",
    "extract_skills",
    "generate_extractive_summary",
    "parse_pdf_document",
    "scan_all_resumes",
]
