from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from models.scam_detector import detect_scam
from models.spam_detector import detect_spam


class PredictRequest(BaseModel):
    subject: str = Field(default="", max_length=20000)
    body: str = Field(default="", max_length=500000)


class UrlResult(BaseModel):
    url: str
    score: float


class SpamResult(BaseModel):
    result: str
    confidence: float


class ScamResult(BaseModel):
    result: str
    confidence: float
    text_score: float
    url_score: float
    matched_keywords: list[str]
    urls: list[UrlResult]


class PredictResponse(BaseModel):
    spam: SpamResult
    scam: ScamResult


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title="MailGuard", version="1.0.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    text = f"{request.subject}\n{request.body}".strip()
    if not text:
        raise HTTPException(status_code=422, detail="Email subject or body is required")

    try:
        spam: dict[str, Any] = detect_spam(text)
        scam: dict[str, Any] = detect_scam(text)
        return PredictResponse(spam=spam, scam=scam)
    except Exception as error:
        raise HTTPException(status_code=503, detail="AI models are unavailable") from error