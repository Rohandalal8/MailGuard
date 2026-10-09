"use client";

import { useEffect } from "react";

const backendHealthUrl = "/api/health";

export default function ServiceWarmup() {
	useEffect(() => {
		void fetch(backendHealthUrl, { cache: "no-store" });
	}, []);

	return null;
}