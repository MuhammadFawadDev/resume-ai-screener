from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from parser import parse_resume
from screening import rank_resumes, hybrid_score
from utils.hashing import hash_file
from typing import List
import json
import io

router = APIRouter()


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extract text from uploaded file (PDF or TXT)."""
    if filename.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")
    elif filename.endswith(".pdf"):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages)
        except Exception:
            return file_bytes.decode("utf-8", errors="ignore")
    return file_bytes.decode("utf-8", errors="ignore")


@router.post("/upload/{job_id}", response_model=schemas.ResumeOut)
async def upload_resume(
    job_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check job exists
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    file_bytes = await file.read()

    # SHA-256 duplicate detection
    file_hash = hash_file(file_bytes)
    existing = db.query(models.Resume).filter(models.Resume.file_hash == file_hash).first()
    if existing:
        raise HTTPException(status_code=400, detail="Duplicate resume detected")

    # Extract text and parse
    text = extract_text_from_file(file_bytes, file.filename)
    parsed = parse_resume(text)

    # Score against job description
    score = hybrid_score(text, job.description)

    # Save to DB
    resume = models.Resume(
        candidate_name=parsed["name"],
        email=parsed["email"],
        skills=json.dumps(parsed["skills"]),
        education=parsed["education"],
        experience=parsed["experience"],
        score=score,
        file_hash=file_hash,
        filename=file.filename,
        job_id=job_id
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/job/{job_id}", response_model=List[schemas.ResumeOut])
def get_ranked_resumes(job_id: int, db: Session = Depends(get_db)):
    resumes = db.query(models.Resume).filter(
        models.Resume.job_id == job_id
    ).order_by(models.Resume.score.desc()).all()
    return resumes


@router.get("/{resume_id}", response_model=schemas.ResumeOut)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.delete("/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}
