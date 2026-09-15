import os
import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


# ==========================================
# Create trained_models folder
# ==========================================

os.makedirs("trained_models", exist_ok=True)


# ==========================================
# SPAM MODEL
# ==========================================

print("\nTraining Spam Detection Model...")


spam_df = pd.read_csv("data/spam_dataset.csv")

spam_df = spam_df.dropna(
    subset=["input", "output"]
)

spam_df["input"] = spam_df["input"].astype(str)

spam_df["output"] = (
    spam_df["output"]
    .astype(str)
    .str.lower()
    .str.strip()
)


# TF-IDF
spam_vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2)
)


X_spam = spam_vectorizer.fit_transform(
    spam_df["input"]
)


# Logistic Regression
spam_model = LogisticRegression(
    max_iter=1000
)


spam_model.fit(
    X_spam,
    spam_df["output"]
)


# Save spam model
joblib.dump(
    spam_vectorizer,
    "trained_models/spam_vectorizer.pkl"
)

joblib.dump(
    spam_model,
    "trained_models/spam_model.pkl"
)


print("✅ Spam model trained successfully!")


# ==========================================
# SCAM / PHISHING URL MODEL
# ==========================================

print("\nTraining Scam / Phishing URL Model...")


scam_df = pd.read_csv(
    "data/scam_dataset.csv"
)


scam_df = scam_df.dropna(
    subset=["URL", "Label"]
)


scam_df["URL"] = scam_df["URL"].astype(str)

scam_df["Label"] = (
    scam_df["Label"]
    .astype(str)
    .str.lower()
    .str.strip()
)


# Convert labels
# bad  = 1
# good = 0

scam_df["target"] = scam_df["Label"].apply(
    lambda x: 1 if x == "bad" else 0
)


# Character-level TF-IDF
url_vectorizer = TfidfVectorizer(
    analyzer="char",
    ngram_range=(2, 5),
    min_df=1
)


X_url = url_vectorizer.fit_transform(
    scam_df["URL"]
)


# Logistic Regression
url_model = LogisticRegression(
    max_iter=1000
)


url_model.fit(
    X_url,
    scam_df["target"]
)


# Save URL model
joblib.dump(
    url_vectorizer,
    "trained_models/url_vectorizer.pkl"
)

joblib.dump(
    url_model,
    "trained_models/url_model.pkl"
)


print("✅ Scam / Phishing URL model trained successfully!")


print("\n" + "=" * 50)
print("🎉 ALL MODELS TRAINED SUCCESSFULLY!")
print("=" * 50)