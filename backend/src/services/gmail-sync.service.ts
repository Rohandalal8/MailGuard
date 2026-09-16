import { prisma } from "../config/database";
import { analyzeEmail, classifyEmail } from "./ai.service";
import { getGmailMessages, gmailClient } from "./gmail.service";

export type GmailSyncResult = {
	synced: number;
	new: number;
	alreadyProcessed: number;
	skipped: number;
};

const activeAccounts = new Set<string>();

export async function syncGmailAccount(accountId: string): Promise<GmailSyncResult> {
	if (activeAccounts.has(accountId)) {
		return { synced: 0, new: 0, alreadyProcessed: 0, skipped: 0 };
	}
	activeAccounts.add(accountId);
	try {
		const account = await prisma.gmailAccount.findUnique({ where: { id: accountId } });
		if (!account) throw new Error("Gmail account not found");
		const messages = await getGmailMessages(gmailClient(account.accessToken ?? "", account.refreshToken), 50);
		let synced = 0;
		let alreadyProcessed = 0;
		let skipped = 0;
		for (const message of messages) {
			try {
				const exists = await prisma.email.findUnique({ where: { userId_gmailMessageId: { userId: account.userId, gmailMessageId: message.id } }, select: { id: true } });
				if (exists) { alreadyProcessed++; continue; }
				const result = await analyzeEmail(message.subject, message.body);
				const category = classifyEmail(result.spam.result, result.scam.result);
				await prisma.email.create({
					data: {
						userId: account.userId,
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
			} catch (error) {
				skipped++;
				console.error(`Skipping Gmail message ${message.id}`, error);
			}
		}
		return { synced, new: synced, alreadyProcessed, skipped };
	} finally {
		activeAccounts.delete(accountId);
	}
}

export async function syncAllGmailAccounts(): Promise<void> {
	const accounts = await prisma.gmailAccount.findMany({ select: { id: true, gmailEmail: true } });
	for (const account of accounts) {
		try {
			const result = await syncGmailAccount(account.id);
			console.log(`Automatic Gmail sync ${account.gmailEmail}: ${result.new} new, ${result.skipped} skipped`);
		} catch (error) {
			console.error(`Automatic Gmail sync failed for ${account.gmailEmail}`, error);
		}
	}
}
