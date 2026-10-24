"""
ProjectVault Python Analysis & NLP API.
FastAPI Application Entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
try:
    from api.routers import analyzer_router, resumes_router
except ImportError:
    from routers import analyzer_router, resumes_router

# Initialize FastAPI application
app = FastAPI(
    title="Job & Project Tracker Analysis API",
    description="Python engine for job analysis, project matching, and local document intelligence",
    version="1.1.0",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json"
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(analyzer_router)
app.include_router(resumes_router)

# Health Check Route
@app.get("/api/py/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "healthy",
        "service": "Job & Project Tracker Analysis API",
        "runtime": "Python (FastAPI)",
        "modules": ["analyzer", "prompt_builder", "local_nlp_engine"]
    }
