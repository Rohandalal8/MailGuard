import { gmail_v1, google } from "googleapis";
import { createOAuthClient } from "../config/gmail";
import { parseBody, parseEmailAddress, parseHeader } from "../utils/email-parser";

export type ParsedGmailMessage = { id: string; threadId: string | undefined; sender: string; senderEmail: string; receiver: string; subject: string; body: string; receivedAt: Date; isRead: boolean };

export function gmailClient(accessToken: string, refreshToken: string) {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: client });
}

export async function getGmailMessages(gmail: gmail_v1.Gmail, maxResults = 50): Promise<ParsedGmailMessage[]> {
  const listed = await gmail.users.messages.list({ userId: "me", maxResults });
  const messages = await Promise.all((listed.data.messages ?? []).map(async ({ id }) => {
    if (!id) return null;
    const result = await gmail.users.messages.get({ userId: "me", id, format: "full" });
    const data = result.data;
    const headers = data.payload?.headers;
    const from = parseEmailAddress(parseHeader(headers, "From"));
    return { id, threadId: data.threadId ?? undefined, sender: from.name || from.email, senderEmail: from.email, receiver: parseHeader(headers, "To"), subject: parseHeader(headers, "Subject"), body: parseBody(data.payload), receivedAt: new Date(Number(data.internalDate ?? Date.now())), isRead: !(data.labelIds ?? []).includes("UNREAD") };
  }));
  return messages.filter((message): message is ParsedGmailMessage => message !== null);
}