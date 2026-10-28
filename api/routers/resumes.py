import os
import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..models.resume import ParseSinglePdfRequest, ExportResumesRequest, ParseRawTextRequest
from ..services.nlp_engine import parse_pdf_document, scan_all_resumes, parse_raw_text
from ..services.ml_parser import get_model_status, reload_models
from ..ml.trainer import train_all_models
from ..ml.learning_log import record_parse_event, get_learning_logs
try:
    from ..config import FEEDBACK_DATA_PATH, PARSED_APPLICATIONS_PATH, atomic_write_json
except ImportError:
    from api.config import FEEDBACK_DATA_PATH, PARSED_APPLICATIONS_PATH, atomic_write_json

router = APIRouter(prefix="/api/py/resumes", tags=["Local Document Intelligence & Resumes"])

class FeedbackCorrectionRequest(BaseModel):
    cover_letter: str
    company_name: str
    job_title: str
    source_portal: Optional[str] = "Direct / Other"
    key_skills: Optional[List[str]] = None
    file_name: Optional[str] = ""
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None

@router.get("/scan")
def scan_resumes(base_dir: str = "data"):
    """Scan all resume & cover letter PDFs using local Document Intelligence."""
    applications = scan_all_resumes(base_dir)
    return {
        "status": "success",
        "engine": "Local Python Document Intelligence & ML (Zero Cloud API)",
        "total_documents": len(applications),
        "data": applications
    }

@router.post("/export")
def export_resumes(payload: ExportResumesRequest):
    """Parse all resume PDFs and export to data/parsed_applications.json."""
    applications = scan_all_resumes(payload.base_dir or "data")
    out_path = payload.output_path or PARSED_APPLICATIONS_PATH
    atomic_write_json(out_path, applications)
    return {
        "status": "success",
        "message": f"Successfully parsed and exported {len(applications)} applications",
        "output_file": out_path,
        "count": len(applications)
    }

@router.post("/parse-file")
def parse_single_pdf(payload: ParseSinglePdfRequest):
    """Parse a single PDF file on-demand using hybrid ML and heuristic parser."""
    if not os.path.exists(payload.file_path):
        raise HTTPException(status_code=404, detail=f"File tidak ditemukan: {payload.file_path}")
    try:
        return {"status": "success", "result": parse_pdf_document(payload.file_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mem-parse PDF: {str(e)}")

@router.post("/parse-text")
def parse_raw_text_content(payload: ParseRawTextRequest):
    """Parse raw text on-demand using hybrid ML and heuristic parser."""
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Teks masukan tidak boleh kosong.")
    try:
        return {"status": "success", "result": parse_raw_text(payload.text, source_hint=payload.source_hint or "Teks Salinan")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mem-parse teks: {str(e)}")

@router.get("/model-status")
def check_ml_model_status():
    """Check training status and evaluation metrics of the local ML parser."""
    return {"status": "success", "data": get_model_status()}

@router.post("/train")
def trigger_model_training():
    """Trigger local ML model training on base data, feedback, and continuous learning logs."""
    try:
        metadata = train_all_models()
        reload_models()
        return {
            "status": "success",
            "message": "Model Machine Learning berhasil dilatih ulang dari basis data dan log.",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melatih model: {str(e)}")

@router.get("/learning-logs")
def view_parser_learning_logs(limit: int = Query(default=50, ge=1, le=200)):
    """Retrieve continuous parser learning logs and learning statistics."""
    try:
        return {"status": "success", "data": get_learning_logs(limit=limit)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal membaca log pembelajaran: {str(e)}")

@router.post("/feedback")
def submit_feedback_correction(payload: FeedbackCorrectionRequest):
    """Store user-verified parse corrections into persistent learning logs and feedback store."""
    try:
        # 1. Save to persistent parser learning log as verified ground-truth
        log_entry = record_parse_event(
            raw_text=payload.cover_letter,
            result={
                "company_name": payload.company_name,
                "job_title": payload.job_title,
                "source_portal": payload.source_portal,
                "key_skills": payload.key_skills or [],
                "location": payload.location,
                "salary_range": payload.salary_range,
                "job_type": payload.job_type,
            },
            source_hint=payload.file_name or "user_correction",
            is_verified=True,
            source="user_correction"
        )

        # 2. Also append to legacy feedback file if valid text present
        raw_cov = (payload.cover_letter or "").strip()[:8000]
        items = []
        if raw_cov and os.path.exists(FEEDBACK_DATA_PATH):
            try:
                with open(FEEDBACK_DATA_PATH, "r", encoding="utf-8") as f:
                    items = json.load(f)
            except Exception:
                items = []

        if raw_cov:
            new_sample = {
                "cover_letter": raw_cov,
                "company_name": payload.company_name.strip(),
                "job_title": payload.job_title.strip(),
                "source_portal": payload.source_portal,
                "key_skills": payload.key_skills or [],
                "file_name": payload.file_name or "user_correction"
            }
            items.append(new_sample)
            if len(items) > 1000:
                items = items[-1000:]
            atomic_write_json(FEEDBACK_DATA_PATH, items)

        return {
            "status": "success",
            "message": "Koreksi hasil berhasil dicatat ke log pembelajaran aktif parser.",
            "logged_sample": log_entry,
            "total_feedback": len(items)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan feedback: {str(e)}")
