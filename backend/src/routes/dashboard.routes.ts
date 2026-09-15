import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/stats", requireAuth, getStats);
export default router;