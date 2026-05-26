from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "recruiter"


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class JobCreate(BaseModel):
    title: str
    description: str


class JobOut(BaseModel):
    id: int
    title: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeOut(BaseModel):
    id: int
    candidate_name: Optional[str]
    email: Optional[str]
    skills: Optional[str]
    education: Optional[str]
    experience: Optional[str]
    score: float
    filename: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
