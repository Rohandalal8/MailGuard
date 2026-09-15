import { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";
import { prisma } from "../config/database";

export interface AuthenticatedRequest extends Request {
	authUser?: { uid: string; email: string; userId: string };
}

export async function requireAuth(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
): Promise<void> {
	if (!firebaseAuth) {
		response.status(503).json({ success: false, message: "Firebase Admin credentials are not configured" });
		return;
	}
	const header = request.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		response.status(401).json({ success: false, message: "Authentication required" });
		return;
	}

	try {
		const decoded = await firebaseAuth.verifyIdToken(header.slice(7));
		if (!decoded.email) {
			response.status(401).json({ success: false, message: "Authenticated email is required" });
			return;
		}
		const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
		if (!user) {
			response.status(401).json({ success: false, message: "User is not synchronized" });
			return;
		}
		request.authUser = { uid: decoded.uid, email: decoded.email, userId: user.id };
		next();
	} catch {
		response.status(401).json({ success: false, message: "Invalid authentication token" });
	}
}
