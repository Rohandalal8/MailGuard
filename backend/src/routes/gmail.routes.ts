import { Router } from "express";
import { connectGmail, disconnectGmail, gmailCallback, gmailStatus, syncGmail } from "../controllers/gmail.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/connect", requireAuth, connectGmail);
router.get("/callback", gmailCallback);
router.get("/status", requireAuth, gmailStatus);
router.post("/sync", requireAuth, syncGmail);
router.post("/disconnect", requireAuth, disconnectGmail);
export default router;
