import joblib
from pathlib import Path


# ==========================================
# Load trained Spam model
# ==========================================

MODEL_DIR = Path(__file__).resolve().parent.parent / "trained_models"

vectorizer = joblib.load(MODEL_DIR / "spam_vectorizer.pkl")

model = joblib.load(MODEL_DIR / "spam_model.pkl")


# ==========================================
# Spam Detection Function
# ==========================================

def detect_spam(email):

    # Convert email into TF-IDF features
    email_vector = vectorizer.transform(
        [email]
    )

    # Prediction
    prediction = model.predict(
        email_vector
    )[0]

    # Probability
    probabilities = model.predict_proba(
        email_vector
    )[0]

    confidence = float(
        probabilities.max() * 100
    )


    # Result
    if prediction == "spam":
        result = "Spam"
    else:
        result = "Normal"


    return {
        "result": result,
        "confidence": round(
            confidence,
            2
        )
    }