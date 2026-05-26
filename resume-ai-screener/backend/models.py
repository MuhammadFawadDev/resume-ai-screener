from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="recruiter")  # admin / recruiter
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resumes = relationship("Resume", back_populates="job")
    owner = relationship("User")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String(100))
    email = Column(String(100))
    skills = Column(Text)           # JSON string of extracted skills
    education = Column(Text)        # Extracted education
    experience = Column(Text)       # Extracted experience
    score = Column(Float, default=0.0)
    file_hash = Column(String(64), unique=True)  # SHA-256 for duplicate detection
    filename = Column(String(255))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="resumes")
