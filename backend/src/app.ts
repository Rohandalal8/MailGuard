import "dotenv/config";
import axios from "axios";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import emailRoutes from "./routes/email.routes";
import gmailRoutes from "./routes/gmail.routes";
import { errorHandler } from "./middleware/error.middleware";

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));
app.get("/health", async (_request, response) => {
  const aiServiceUrl = (process.env.AI_SERVICE_URL ?? "http://localhost:8000").replace(/\/$/, "");
  let aiStatus: "ok" | "down" = "down";

  try {
    const aiResponse = await axios.get(`${aiServiceUrl}/health`, { timeout: 5000 });
    aiStatus = aiResponse.status >= 200 && aiResponse.status < 300 ? "ok" : "down";
  } catch {
    aiStatus = "down";
  }

  response.json({
    success: true,
    data: {
      status: "ok",
      services: {
        backend: "ok",
        ai: aiStatus,
      },
    },
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(errorHandler);
