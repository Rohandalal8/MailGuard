import { Response } from "express";
import { prisma } from "../config/database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function getStats(request: AuthenticatedRequest, response: Response): Promise<void> {
  const userId = request.authUser!.userId;
  const [groups, recent, gmailAccount] = await Promise.all([prisma.email.groupBy({ by: ["category"], where: { userId }, _count: { _all: true } }), prisma.email.findMany({ where: { userId }, orderBy: { receivedAt: "desc" }, take: 5, select: { id: true, sender: true, subject: true, category: true, receivedAt: true, bodyPreview: true } }), prisma.gmailAccount.findFirst({ where: { userId }, select: { gmailEmail: true } })]);
  const counts = { INBOX: 0, SPAM: 0, SCAM: 0 };
  groups.forEach((group) => { counts[group.category] = group._count._all; });
  response.json({ success: true, data: { total: counts.INBOX + counts.SPAM + counts.SCAM, ...counts, recentEmails: recent, gmailConnected: Boolean(gmailAccount), gmailEmail: gmailAccount?.gmailEmail ?? null } });
}