"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { api, apiData } from "../lib/api";
import type { DashboardStats } from "../types/analysis";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) { const router = useRouter(); const { user, loading } = useAuth(); const [stats, setStats] = useState<DashboardStats | null>(null); useEffect(() => { let active = true; async function loadStats() { if (!user) return; try { const result = await apiData<DashboardStats>(api.get("/dashboard/stats")); if (active) setStats(result); } catch { if (active) setStats(null); } } if (!loading && !user) router.replace("/login"); void loadStats(); return () => { active = false; }; }, [loading, user, router]); if (loading || !user) return <main className="login"><p className="muted">Checking your session...</p></main>; return <div className="shell"><Sidebar stats={stats} /><main className="main"><Navbar />{children}</main></div>; }