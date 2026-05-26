import spacy
import re
from typing import Dict, List

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "node", "fastapi",
    "django", "flask", "sql", "mysql", "postgresql", "mongodb", "docker",
    "kubernetes", "aws", "azure", "git", "machine learning", "deep learning",
    "nlp", "bert", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "c++", "c#", ".net", "html", "css", "rest api", "graphql", "linux", "bash"
]

EDUCATION_KEYWORDS = ["bachelor", "master", "phd", "b.e", "b.s", "m.s", "university", "college", "degree"]

EXPERIENCE_KEYWORDS = ["intern", "engineer", "developer", "analyst", "manager", "lead", "worked", "developed", "built"]


def extract_email(text: str) -> str:
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else ""


def extract_name(text: str) -> str:
    doc = nlp(text[:500])
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    lines = text.strip().split('\n')
    return lines[0].strip() if lines else ""


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found = [skill for skill in SKILL_KEYWORDS if skill in text_lower]
    return list(set(found))


def extract_education(text: str) -> str:
    lines = text.split('\n')
    edu_lines = [line for line in lines if any(kw in line.lower() for kw in EDUCATION_KEYWORDS)]
    return " | ".join(edu_lines[:3]) if edu_lines else "Not found"


def extract_experience(text: str) -> str:
    lines = text.split('\n')
    exp_lines = [line for line in lines if any(kw in line.lower() for kw in EXPERIENCE_KEYWORDS)]
    return " | ".join(exp_lines[:3]) if exp_lines else "Not found"


def parse_resume(text: str) -> Dict:
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
    }
