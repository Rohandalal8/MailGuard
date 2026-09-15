import "dotenv/config";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";

const hasFirebaseCredentials = Boolean(
	process.env.FIREBASE_PROJECT_ID &&
	process.env.FIREBASE_CLIENT_EMAIL &&
	process.env.FIREBASE_PRIVATE_KEY,
);

const app = hasFirebaseCredentials
	? getApps()[0] ?? initializeApp({
			credential: cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
			}),
		})
	: null;

export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
