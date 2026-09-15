import re
import joblib
from urllib.parse import urlparse


# ==========================================
# Load trained URL model
# ==========================================

url_vectorizer = joblib.load(
    "trained_models/url_vectorizer.pkl"
)

url_model = joblib.load(
    "trained_models/url_model.pkl"
)


# ==========================================
# Trusted / Legitimate Domains
# ==========================================

TRUSTED_DOMAINS = {
    "google.com",
    "gmail.com",
    "github.com",
    "gitlab.com",
    "microsoft.com",
    "apple.com",
    "amazon.com",
    "linkedin.com",
    "facebook.com",
    "instagram.com",
    "youtube.com",
    "wikipedia.org",
    "stackoverflow.com",
    "openai.com",
    "paypal.com"
}


# ==========================================
# Scam-related keywords
# ==========================================

SCAM_KEYWORDS = [

    "verify your account",
    "verify account",

    "account will be blocked",
    "account will be suspended",
    "account suspended",

    "urgent action",
    "urgent",

    "click here",
    "click the link",

    "confirm your identity",
    "confirm your account",

    "update your account",
    "update payment",

    "payment required",

    "send money",
    "transfer money",
    "wire transfer",

    "claim your prize",
    "claim your reward",

    "you have won",
    "congratulations you won",

    "winner",
    "lottery",
    "cash prize",

    "free money",
    "free gift",

    "refund",
    "tax refund",

    "otp",
    "password",

    "credit card",
    "bank account",

    "security alert",

    "login immediately",

    "limited time",
    "act now",
    "pay now"
]


# ==========================================
# Clean URL
# ==========================================

def clean_url(url):

    # Remove punctuation accidentally attached
    # to URL in an email sentence.

    url = url.strip()

    url = url.rstrip(
        ".,!?;:'\")]}>"
    )

    return url


# ==========================================
# Get Domain
# ==========================================

def get_domain(url):

    url = clean_url(url)

    # Add protocol if missing
    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    parsed = urlparse(url)

    domain = parsed.netloc.lower()

    # Remove www.
    domain = domain.replace("www.", "")

    # Remove port
    domain = domain.split(":")[0]

    return domain


# ==========================================
# Check Trusted Domain
# ==========================================

def is_trusted_domain(url):

    domain = get_domain(url)

    if domain in TRUSTED_DOMAINS:
        return True

    # Also allow subdomains of trusted domains
    for trusted in TRUSTED_DOMAINS:

        if domain.endswith("." + trusted):
            return True

    return False


# ==========================================
# Extract URLs
# ==========================================

def extract_urls(text):

    url_pattern = (
        r"(?:https?://|www\.)[^\s]+"
        r"|(?:[a-zA-Z0-9-]+\.)+"
        r"[a-zA-Z]{2,}(?:/[^\s]*)?"
    )

    urls = re.findall(
        url_pattern,
        text
    )

    # Clean URLs
    urls = [
        clean_url(url)
        for url in urls
    ]

    return urls


# ==========================================
# Text Scam Detection
# ==========================================

def detect_text_scam(text):

    text_lower = text.lower()

    matched_keywords = []

    for keyword in SCAM_KEYWORDS:

        if keyword in text_lower:
            matched_keywords.append(keyword)


    # --------------------------------------
    # Calculate text score
    # --------------------------------------

    if len(matched_keywords) >= 3:

        score = 90

    elif len(matched_keywords) == 2:

        score = 70

    elif len(matched_keywords) == 1:

        score = 40

    else:

        score = 0


    return score, matched_keywords


# ==========================================
# URL Scam Detection
# ==========================================

def detect_url_scam(url):

    url = clean_url(url)

    # --------------------------------------
    # Trusted domain check
    # --------------------------------------

    if is_trusted_domain(url):

        return 0.0


    # --------------------------------------
    # ML model
    # --------------------------------------

    url_vector = url_vectorizer.transform(
        [url]
    )

    probabilities = url_model.predict_proba(
        url_vector
    )[0]


    # Probability of bad/malicious URL
    malicious_probability = float(
        probabilities[1] * 100
    )


    return round(
        malicious_probability,
        2
    )


# ==========================================
# Main Scam Detection
# ==========================================

def detect_scam(email):

    # --------------------------------------
    # Text analysis
    # --------------------------------------

    text_score, matched_keywords = (
        detect_text_scam(email)
    )


    # --------------------------------------
    # URL analysis
    # --------------------------------------

    urls = extract_urls(email)

    url_results = []


    for url in urls:

        score = detect_url_scam(url)

        url_results.append({

            "url": url,

            "score": score

        })


    # --------------------------------------
    # Highest URL risk
    # --------------------------------------

    if url_results:

        url_score = max(
            item["score"]
            for item in url_results
        )

    else:

        url_score = 0


    # --------------------------------------
    # Final score
    # --------------------------------------

    final_score = max(
        text_score,
        url_score
    )


    # --------------------------------------
    # Final classification
    # --------------------------------------

    if final_score >= 70:

        result = "Scam / Phishing"

    elif final_score >= 40:

        result = "Suspicious"

    else:

        result = "Safe"


    return {

        "result": result,

        "confidence": round(
            float(final_score),
            2
        ),

        "text_score": text_score,

        "url_score": round(
            float(url_score),
            2
        ),

        "matched_keywords": matched_keywords,

        "urls": url_results

    }