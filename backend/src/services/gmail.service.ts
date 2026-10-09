import { gmail_v1, google } from "googleapis";
import { createOAuthClient } from "../config/gmail";
import { parseBody, parseEmailAddress, parseHeader } from "../utils/email-parser";

export type ParsedGmailMessage = { id: string; threadId: string | undefined; sender: string; senderEmail: string; receiver: string; subject: string; body: string; receivedAt: Date; isRead: boolean };

export function gmailClient(accessToken: string, refreshToken: string) {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: client });
}

export async function getGmailMessages(gmail: gmail_v1.Gmail, maxResults = 100, query?: string): Promise<ParsedGmailMessage[]> {
  const messageIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const listed = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      ...(query ? { q: query } : {}),
      ...(pageToken ? { pageToken } : {}),
    });
    messageIds.push(...(listed.data.messages ?? []).flatMap(({ id }) => id ? [id] : []));
    pageToken = listed.data.nextPageToken ?? undefined;
  } while (pageToken);

  const messages: Array<ParsedGmailMessage | null> = [];
  for (let index = 0; index < messageIds.length; index += 20) {
    const batch = await Promise.all(messageIds.slice(index, index + 20).map(async (id) => {
      const result = await gmail.users.messages.get({ userId: "me", id, format: "full" });
      const data = result.data;
      const headers = data.payload?.headers;
      const from = parseEmailAddress(parseHeader(headers, "From"));
      return { id, threadId: data.threadId ?? undefined, sender: from.name || from.email, senderEmail: from.email, receiver: parseHeader(headers, "To"), subject: parseHeader(headers, "Subject"), body: parseBody(data.payload), receivedAt: new Date(Number(data.internalDate ?? Date.now())), isRead: !(data.labelIds ?? []).includes("UNREAD") };
    }));
    messages.push(...batch);
  }

  return messages.filter((message): message is ParsedGmailMessage => message !== null);
}