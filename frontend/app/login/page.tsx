"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

function getAuthErrorMessage(error: unknown): string {
	const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "unknown";
	const rawMessage = error instanceof Error ? error.message : String(error);
	if (rawMessage.includes("CONFIGURATION_NOT_FOUND")) {
		return "Firebase Authentication is not configured for this project. Open Firebase Console > Authentication > Get started, enable Google sign-in, then restart the frontend. (CONFIGURATION_NOT_FOUND)";
	}
	const messages: Record<string, string> = {
		"auth/unauthorized-domain": "Add localhost to Firebase Console > Authentication > Settings > Authorized domains.",
		"auth/operation-not-allowed": "Enable Google in Firebase Console > Authentication > Sign-in method.",
		"auth/popup-blocked": "Allow popups for localhost and try again.",
		"auth/popup-closed-by-user": "The Google sign-in window was closed before completing login.",
		"auth/invalid-api-key": "The Firebase web API key is invalid. Copy the Web app config again.",
	};
	return `${messages[code] ?? "Google sign-in failed. Check the browser console for the Firebase error."} (${code})`;
}

export default function LoginPage() {
	const router = useRouter();
	const { user, loading, signInWithGoogle } = useAuth();
	const [error, setError] = useState("");
	useEffect(() => {
		if (!loading && user) router.replace("/dashboard");
	}, [loading, user, router]);
	return <main className="login"><section className="panel" style={{ width: "min(440px, calc(100% - 36px))" }}><div className="eyebrow">MAILGUARD AI</div><h1>Secure your inbox.</h1><p className="muted">Sign in with Google, then explicitly connect the Gmail mailbox you want analyzed.</p><button className="button" disabled={loading} onClick={() => void signInWithGoogle().then(() => router.push("/dashboard")).catch((reason: unknown) => setError(getAuthErrorMessage(reason)))}>Continue with Google</button>{error && <p style={{ color: "#9c2d20", lineHeight: 1.5 }}>{error}</p>}</section></main>;
}
