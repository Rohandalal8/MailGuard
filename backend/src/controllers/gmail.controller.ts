import { Request, Response } from "express";
import { prisma } from "../config/database";
import { createOAuthClient, gmailScopes } from "../config/gmail";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { analyzeEmail, classifyEmail } from "../services/ai.service";
import { getGmailMessages, gmailClient } from "../services/gmail.service";
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
    response.redirect(`${process.env.FRONTEND_URL ?? "http://localhost:3000"}/settings?gmail=connected`);
  } catch { response.status(502).send("Gmail authorization failed"); }
}

export async function gmailStatus(request: AuthenticatedRequest, response: Response): Promise<void> {
  const account = await prisma.gmailAccount.findFirst({ where: { userId: request.authUser!.userId }, select: { gmailEmail: true, updatedAt: true } });
  response.json({ success: true, data: { connected: Boolean(account), gmailEmail: account?.gmailEmail ?? null, updatedAt: account?.updatedAt ?? null } });
}

export async function syncGmail(request: AuthenticatedRequest, response: Response): Promise<void> {
  const account = await prisma.gmailAccount.findFirst({ where: { userId: request.authUser!.userId } });
  if (!account) { response.status(400).json({ success: false, message: "Connect Gmail first" }); return; }
  const messages = await getGmailMessages(gmailClient(account.accessToken ?? "", account.refreshToken), 50);
  let synced = 0; let alreadyProcessed = 0;
  for (const message of messages) {
    const exists = await prisma.email.findUnique({ where: { userId_gmailMessageId: { userId: request.authUser!.userId, gmailMessageId: message.id } }, select: { id: true } });
    if (exists) { alreadyProcessed++; continue; }
    const result = await analyzeEmail(message.subject, message.body);
    const category = classifyEmail(result.spam.result, result.scam.result);
    await prisma.email.create({
      data: {
        userId: request.authUser!.userId,
        gmailAccountId: account.id,
        gmailMessageId: message.id,
        gmailThreadId: message.threadId,
        sender: message.sender,
        senderEmail: message.senderEmail,
        receiver: message.receiver,
        subject: message.subject || "(no subject)",
        body: message.body,
        bodyPreview: message.body.slice(0, 240),
        receivedAt: message.receivedAt,
        category,
        isRead: message.isRead,
        analysis: {
          create: {
            spamResult: result.spam.result,
            spamConfidence: result.spam.confidence,
            scamResult: result.scam.result,
            scamConfidence: result.scam.confidence,
            textScore: result.scam.text_score,
            urlScore: result.scam.url_score,
            matchedKeywords: { create: result.scam.matched_keywords.map((keyword) => ({ keyword })) },
            detectedUrls: { create: result.scam.urls.map((url) => ({ url: url.url, riskScore: url.score })) },
          },
        },
      },
    });
    synced++;
  }
  response.json({ success: true, data: { synced, new: synced, alreadyProcessed } });
}

export async function disconnectGmail(request: AuthenticatedRequest, response: Response): Promise<void> {
  await prisma.gmailAccount.deleteMany({ where: { userId: request.authUser!.userId } });
  response.json({ success: true, data: { disconnected: true } });
}