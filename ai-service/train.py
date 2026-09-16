from pathlib import Path
import joblib
import kagglehub
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "trained_models"
DATASET = "akshatsharma2/the-biggest-spam-ham-phish-email-dataset-300000"
LABEL_PHISHING = 1
LABEL_SPAM = 2


def load_dataset() -> pd.DataFrame:
    dataset_dir = Path(kagglehub.dataset_download(DATASET))
    csv_files = sorted(dataset_dir.rglob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV file found in {dataset_dir}")
    dataset = pd.read_csv(csv_files[0], usecols=["label", "text"])
    dataset = dataset.dropna(subset=["label", "text"]).copy()
    dataset["label"] = pd.to_numeric(dataset["label"], errors="coerce")
    dataset = dataset.dropna(subset=["label"])
    dataset["label"] = dataset["label"].astype(int)
    dataset["text"] = dataset["text"].astype(str).str.slice(0, 20000)
    dataset = dataset[dataset["label"].isin([0, LABEL_SPAM, LABEL_PHISHING])]
    if dataset.empty:
        raise ValueError("Expected labels 0=ham, 1=phishing, 2=spam")
    return dataset


def train_binary_model(texts: pd.Series, labels: pd.Series, name: str) -> None:
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_features=200000,
        sublinear_tf=True,
    )
    train_features = vectorizer.fit_transform(train_texts)
    test_features = vectorizer.transform(test_texts)
    model = LogisticRegression(max_iter=1000, class_weight="balanced", solver="lbfgs")
    model.fit(train_features, train_labels)
    print(f"\n{name} validation report:")
    print(classification_report(test_labels, model.predict(test_features), zero_division=0))
    joblib.dump(vectorizer, MODEL_DIR / f"{name}_vectorizer.pkl")
    joblib.dump(model, MODEL_DIR / f"{name}_model.pkl")


def train_category_model(dataset: pd.DataFrame) -> None:
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        dataset["text"], dataset["label"], test_size=0.2, random_state=42, stratify=dataset["label"]
    )
    vectorizer = TfidfVectorizer(
        lowercase=True, stop_words="english", ngram_range=(1, 2), min_df=2,
        max_features=200000, sublinear_tf=True,
    )
    train_features = vectorizer.fit_transform(train_texts)
    test_features = vectorizer.transform(test_texts)
    model = LogisticRegression(max_iter=1000, class_weight="balanced", solver="lbfgs")
    model.fit(train_features, train_labels)
    print("\ncategory validation report:")
    print(classification_report(test_labels, model.predict(test_features), zero_division=0))
    joblib.dump(vectorizer, MODEL_DIR / "category_vectorizer.pkl")
    joblib.dump(model, MODEL_DIR / "category_model.pkl")


def main() -> None:
    MODEL_DIR.mkdir(exist_ok=True)
    dataset = load_dataset()
    print(f"Rows: {len(dataset)}\nLabels:\n{dataset['label'].value_counts().sort_index()}")
    spam_dataset = dataset[dataset["label"] != LABEL_PHISHING]
    train_binary_model(spam_dataset["text"], (spam_dataset["label"] == LABEL_SPAM).astype(int), "spam")
    phishing_labels = (dataset["label"] == LABEL_PHISHING).astype(int)
    train_binary_model(dataset["text"], phishing_labels, "scam")
    train_category_model(dataset)
    print("\nModels saved to trained_models/")


if __name__ == "__main__":
    main()
