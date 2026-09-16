from pathlib import Path
import joblib

MODEL_DIR = Path(__file__).resolve().parent.parent / "trained_models"
scam_vectorizer = joblib.load(MODEL_DIR / "scam_vectorizer.pkl")
scam_model = joblib.load(MODEL_DIR / "scam_model.pkl")
category_vectorizer = joblib.load(MODEL_DIR / "category_vectorizer.pkl")
category_model = joblib.load(MODEL_DIR / "category_model.pkl")


def detect_scam(email: str) -> dict:
    features = category_vectorizer.transform([email])
    probabilities = category_model.predict_proba(features)[0]
    phishing_index = list(category_model.classes_).index(2)
    final_score = float(probabilities[phishing_index] * 100)
    result = "Scam / Phishing" if final_score >= 70 else "Suspicious" if final_score >= 40 else "Safe"
    return {
        "result": result,
        "confidence": round(final_score, 2),
        "text_score": round(final_score, 2),
        "url_score": 0.0,
        "matched_keywords": [],
        "urls": [],
    }
