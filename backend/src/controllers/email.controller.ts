import { Response } from "express";
import { prisma } from "../config/database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function listEmails(request: AuthenticatedRequest, response: Response): Promise<void> {
  const page = Math.max(Number(request.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);
  const category = typeof request.query.category === "string" ? request.query.category : undefined;
  const search = typeof request.query.search === "string" ? request.query.search : undefined;
  const where = { userId: request.authUser!.userId, ...(category && ["INBOX", "SPAM", "SCAM"].includes(category) ? { category: category as "INBOX" | "SPAM" | "SCAM" } : {}), ...(search ? { OR: [{ subject: { contains: search, mode: "insensitive" as const } }, { sender: { contains: search, mode: "insensitive" as const } }, { senderEmail: { contains: search, mode: "insensitive" as const } }, { bodyPreview: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [total, emails] = await Promise.all([prisma.email.count({ where }), prisma.email.findMany({ where, orderBy: { receivedAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, sender: true, senderEmail: true, subject: true, bodyPreview: true, receivedAt: true, category: true, isRead: true, analysis: { select: { spamConfidence: true, scamConfidence: true } } } })]);
  response.json({ success: true, data: { emails, page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function getEmail(request: AuthenticatedRequest, response: Response): Promise<void> {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const email = await prisma.email.findFirst({ where: { id, userId: request.authUser!.userId }, include: { analysis: { include: { matchedKeywords: true, detectedUrls: true } } } });
  if (!email) { response.status(404).json({ success: false, message: "Email not found" }); return; }
  response.json({ success: true, data: email });
}