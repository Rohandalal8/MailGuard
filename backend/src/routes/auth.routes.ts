import { Router } from "express";
import { getMe, syncUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.post("/sync-user", syncUser);
router.get("/me", requireAuth, getMe);
export default router;