import { Router } from "express";
import { getEmail, listEmails } from "../controllers/email.controller";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.use(requireAuth);
router.get("/", listEmails);
for (const [path, category] of [["/inbox", "INBOX"], ["/spam", "SPAM"], ["/scam", "SCAM"]] as const) {
	router.get(path, (request, response, next) => {
		request.query.category = category;
		void listEmails(request as AuthenticatedRequest, response).catch(next);
	});
}
router.get("/:id", getEmail);
export default router;