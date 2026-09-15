type GmailPart = {
	mimeType?: string | null;
	body?: { data?: string | null } | null;
	parts?: GmailPart[];
};

function decode(data?: string | null): string {
	if (!data) return "";
	return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function collectParts(part: GmailPart | undefined, mimeType: string, output: string[]): void {
	if (!part) return;
	if (part.mimeType === mimeType && part.body?.data) output.push(decode(part.body.data));
	part.parts?.forEach((child) => collectParts(child, mimeType, output));
}

function stripHtml(html: string): string {
	return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

export function parseBody(payload: GmailPart | undefined): string {
	const plain: string[] = [];
	collectParts(payload, "text/plain", plain);
	if (plain.length) return plain.join("\n").trim();
	const html: string[] = [];
	collectParts(payload, "text/html", html);
	if (html.length) return stripHtml(html.join("\n"));
	return decode(payload?.body?.data).trim();
}

export function parseHeader(headers: Array<{ name?: string | null; value?: string | null }> | undefined, name: string): string {
	return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function parseEmailAddress(value: string): { name: string; email: string } {
	const match = value.match(/^(.*?)\s*<([^>]+)>$/);
	return match ? { name: match[1].replace(/^"|"$/g, "").trim(), email: match[2].trim() } : { name: value.trim(), email: value.trim() };
}
