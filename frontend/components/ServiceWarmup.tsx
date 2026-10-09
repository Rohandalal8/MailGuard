"use client";

import { useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const backendHealthUrl = `${apiUrl.replace(/\/api\/?$/, "")}/health`;

export default function ServiceWarmup() {
	useEffect(() => {
		void fetch(backendHealthUrl, { cache: "no-store" });
	}, []);

	return null;
}