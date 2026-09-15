import crypto from "node:crypto";

const secret = process.env.OAUTH_STATE_SECRET ?? "development-oauth-state-secret";

export function createOAuthState(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, expires: Date.now() + 10 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyOAuthState(state: string): string | null {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: string; expires: number };
  return data.expires > Date.now() ? data.userId : null;
}