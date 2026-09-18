"use client";

import { useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const backendHealthUrl = `${apiUrl.replace(/\/api\/?$/, "")}/health`;
const aiHealthUrl = `${(process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "http://localhost:8000").replace(/\/$/, "")}/health`;

export default function ServiceWarmup() {
	useEffect(() => {
		void Promise.allSettled([
			fetch(backendHealthUrl, { cache: "no-store" }),
			fetch(aiHealthUrl, { cache: "no-store" }),
		]);
	}, []);

	return null;
}