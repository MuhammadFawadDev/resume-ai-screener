from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np
from typing import List, Tuple


# ── BERT setup ──────────────────────────────────────────────────────────────
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    bert_model = AutoModel.from_pretrained(MODEL_NAME)
    BERT_AVAILABLE = True
except Exception:
    BERT_AVAILABLE = False
    print("BERT model not available, falling back to TF-IDF only.")


def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)


def bert_similarity(text1: str, text2: str) -> float:
    if not BERT_AVAILABLE:
        return 0.0
    try:
        encoded = tokenizer([text1, text2], padding=True, truncation=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            output = bert_model(**encoded)
        embeddings = mean_pooling(output, encoded["attention_mask"])
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
        similarity = torch.nn.functional.cosine_similarity(embeddings[0].unsqueeze(0), embeddings[1].unsqueeze(0))
        return float(similarity.item())
    except Exception:
        return 0.0


def tfidf_similarity(text1: str, text2: str) -> float:
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(score)
    except Exception:
        return 0.0


def hybrid_score(resume_text: str, job_description: str, bert_weight: float = 0.6) -> float:
    """
    Hybrid scoring: BERT (60%) + TF-IDF (40%)
    Falls back to TF-IDF only if BERT unavailable.
    """
    tfidf_score = tfidf_similarity(resume_text, job_description)

    if BERT_AVAILABLE:
        b_score = bert_similarity(resume_text, job_description)
        final = (bert_weight * b_score) + ((1 - bert_weight) * tfidf_score)
    else:
        final = tfidf_score

    return round(final * 100, 2)  # Return as percentage


def rank_resumes(resumes: List[Tuple[int, str]], job_description: str) -> List[Tuple[int, float]]:
    """
    Takes list of (resume_id, resume_text) and returns sorted list of (resume_id, score).
    """
    scored = [(rid, hybrid_score(text, job_description)) for rid, text in resumes]
    return sorted(scored, key=lambda x: x[1], reverse=True)
