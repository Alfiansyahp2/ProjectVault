import os
import json
from fastapi import APIRouter, HTTPException
from ..models.resume import ParseSinglePdfRequest, ExportResumesRequest
from ..services.nlp_engine import parse_pdf_document, scan_all_resumes

router = APIRouter(prefix="/api/py/resumes", tags=["Local Document Intelligence & Resumes"])

@router.get("/scan")
def scan_resumes(base_dir: str = "data"):
    """
    Scan all resume & cover letter PDFs using local Python Document Intelligence
    and NLP engine. No external API key required.
    """
    applications = scan_all_resumes(base_dir)
    return {
        "status": "success",
        "engine": "Local Python Document Intelligence & NLP (Zero Cloud API)",
        "total_documents": len(applications),
        "data": applications
    }

@router.post("/export")
def export_resumes(payload: ExportResumesRequest):
    """
    Parse all resume PDFs and export to a structured JSON file in data/parsed_applications.json
    for offline database persistence or UI sync.
    """
    applications = scan_all_resumes(payload.base_dir or "data")
    out_path = payload.output_path or "data/parsed_applications.json"
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(applications, f, indent=2, ensure_ascii=False)
        
    return {
        "status": "success",
        "message": f"Successfully parsed and exported {len(applications)} applications",
        "output_file": out_path,
        "count": len(applications)
    }

@router.post("/parse-file")
def parse_single_pdf(payload: ParseSinglePdfRequest):
    """Parse a single PDF file on-demand using the local NLP pipeline."""
    if not os.path.exists(payload.file_path):
        raise HTTPException(status_code=404, detail=f"File tidak ditemukan: {payload.file_path}")
        
    try:
        result = parse_pdf_document(payload.file_path)
        return {
            "status": "success",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mem-parse PDF: {str(e)}")
