import { Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";
import { prisma } from "../config/database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function syncUser(request: Request, response: Response): Promise<void> {
  if (!firebaseAuth) { response.status(503).json({ success: false, message: "Firebase Admin credentials are not configured" }); return; }
  const token = typeof request.body?.firebaseToken === "string" ? request.body.firebaseToken : "";
  if (!token) { response.status(400).json({ success: false, message: "firebaseToken is required" }); return; }
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    if (!decoded.email) { response.status(400).json({ success: false, message: "Firebase account has no email" }); return; }
    const user = await prisma.user.upsert({ where: { firebaseUid: decoded.uid }, update: { email: decoded.email, name: decoded.name ?? null, photoUrl: decoded.picture ?? null }, create: { firebaseUid: decoded.uid, email: decoded.email, name: decoded.name ?? null, photoUrl: decoded.picture ?? null } });
    response.json({ success: true, data: { id: user.id, email: user.email, name: user.name, photoUrl: user.photoUrl } });
  } catch { response.status(401).json({ success: false, message: "Invalid Firebase token" }); }
}

export async function getMe(request: AuthenticatedRequest, response: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: request.authUser!.userId }, select: { id: true, email: true, name: true, photoUrl: true } });
  response.json({ success: true, data: user });
}