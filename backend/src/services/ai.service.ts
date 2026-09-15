import axios from "axios";

export type AIResult = {
  spam: { result: string; confidence: number };
  scam: { result: string; confidence: number; text_score: number; url_score: number; matched_keywords: string[]; urls: Array<{ url: string; score: number }> };
};

export async function analyzeEmail(subject: string, body: string): Promise<AIResult> {
  const response = await axios.post<AIResult>(`${process.env.AI_SERVICE_URL ?? "http://localhost:8000"}/predict`, { subject, body }, { timeout: 30000 });
  return response.data;
}

export function classifyEmail(spamResult: string, scamResult: string): "INBOX" | "SPAM" | "SCAM" {
  if (scamResult === "Scam / Phishing") return "SCAM";
  if (spamResult === "Spam") return "SPAM";
  return "INBOX";
}