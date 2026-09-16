import { Request, Response } from "express";
import { prisma } from "../config/database";
import { createOAuthClient, gmailScopes } from "../config/gmail";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { syncGmailAccount } from "../services/gmail-sync.service";
import { gmailClient } from "../services/gmail.service";
import { createOAuthState, verifyOAuthState } from "../utils/token";

export function connectGmail(request: AuthenticatedRequest, response: Response): void {
  const client = createOAuthClient();
  const url = client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: gmailScopes, state: createOAuthState(request.authUser!.userId) });
  response.json({ success: true, data: { authorizationUrl: url } });
}

export async function gmailCallback(request: Request, response: Response): Promise<void> {
  const userId = typeof request.query.state === "string" ? verifyOAuthState(request.query.state) : null;
  const code = typeof request.query.code === "string" ? request.query.code : null;
  if (!userId || !code) { response.status(400).send("Invalid Gmail authorization request"); return; }
  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) { response.status(400).send("Google did not return a refresh token; reconnect with consent"); return; }
    client.setCredentials(tokens);
    const gmail = gmailClient(tokens.access_token ?? "", tokens.refresh_token);
    const profile = await gmail.users.getProfile({ userId: "me" });
    await prisma.gmailAccount.upsert({ where: { userId_gmailEmail: { userId, gmailEmail: profile.data.emailAddress ?? "" } }, update: { accessToken: tokens.access_token ?? null, refreshToken: tokens.refresh_token, tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null, googleAccountId: profile.data.emailAddress ?? null }, create: { userId, gmailEmail: profile.data.emailAddress ?? "", googleAccountId: profile.data.emailAddress ?? null, accessToken: tokens.access_token ?? null, refreshToken: tokens.refresh_token, tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null } });
    response.redirect(`${process.env.FRONTEND_URL ?? "http://localhost:3000"}/dashboard?gmail=connected`);
  } catch { response.status(502).send("Gmail authorization failed"); }
}

export async function gmailStatus(request: AuthenticatedRequest, response: Response): Promise<void> {
  const account = await prisma.gmailAccount.findFirst({ where: { userId: request.authUser!.userId }, select: { gmailEmail: true, updatedAt: true } });
  response.json({ success: true, data: { connected: Boolean(account), gmailEmail: account?.gmailEmail ?? null, updatedAt: account?.updatedAt ?? null } });
}

export async function syncGmail(request: AuthenticatedRequest, response: Response): Promise<void> {
  try {
    const account = await prisma.gmailAccount.findFirst({ where: { userId: request.authUser!.userId } });
    if (!account) { response.status(400).json({ success: false, message: "Connect Gmail first" }); return; }
    response.json({ success: true, data: await syncGmailAccount(account.id) });
  } catch (error) {
    console.error("Gmail sync failed", error);
    response.status(502).json({ success: false, message: "Gmail sync failed. Check Gmail authorization, database, and AI service." });
  }
}

export async function disconnectGmail(request: AuthenticatedRequest, response: Response): Promise<void> {
  await prisma.gmailAccount.deleteMany({ where: { userId: request.authUser!.userId } });
  response.json({ success: true, data: { disconnected: true } });
}