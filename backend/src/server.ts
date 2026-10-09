import "dotenv/config";
import { app } from "./app";
import { syncAllGmailAccounts } from "./services/gmail-sync.service";

const port = Number(process.env.PORT ?? 5000);
const intervalMs = Number(process.env.GMAIL_SYNC_INTERVAL_MS ?? 900000);

app.listen(port, () => {
	console.log(`MailGuard backend listening on port ${port}`);
	console.log(`Automatic Gmail sync interval: ${intervalMs}ms`);
	const runSync = () => void syncAllGmailAccounts().catch((error: unknown) => console.error("Automatic Gmail sync failed", error));
	runSync();
	setInterval(runSync, intervalMs);
});
