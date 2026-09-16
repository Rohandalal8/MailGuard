"use client";
import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import EmailList from "../../components/EmailList";
import GmailConnect from "../../components/GmailConnect";
import { useAuth } from "../../hooks/useAuth";
import { api, apiData } from "../../lib/api";
import type { DashboardStats } from "../../types/analysis";
import type { Email } from "../../types/email";

export default function DashboardPage() { const { loading: authLoading } = useAuth(); const [stats, setStats] = useState<DashboardStats | null>(null); const [recent, setRecent] = useState<Email[]>([]); const [statsLoading, setStatsLoading] = useState(true); const [error, setError] = useState(""); async function refresh() { setStatsLoading(true); try { const result = await apiData<DashboardStats>(api.get("/dashboard/stats")); setStats(result); setRecent(result.recentEmails); setError(""); window.dispatchEvent(new Event("dashboard-stats-updated")); } catch { setError("Unable to load dashboard data. Please refresh after signing in."); } finally { setStatsLoading(false); } } useEffect(() => { if (!authLoading) void refresh(); }, [authLoading]); const values = statsLoading ? [["Total emails", "..."], ["Inbox", "..."], ["Spam", "..."], ["Scam", "..."]] : [["Total emails", stats?.total ?? 0], ["Inbox", stats?.INBOX ?? 0], ["Spam", stats?.SPAM ?? 0], ["Scam", stats?.SCAM ?? 0]]; return <AppShell><div className="eyebrow">Overview</div><h1>Your email perimeter.</h1>{error && <div className="panel section"><p style={{ color: "#9c2d20" }}>{error}</p></div>}<div className="grid section">{values.map(([label, value]) => <div className="stat" key={label}><span className="muted">{label}</span><strong>{value}</strong></div>)}</div><div className="section"><GmailConnect onChange={() => void refresh()} hideWhenConnected /></div><section className="section"><h2>Recent mail</h2><EmailList emails={recent} /></section></AppShell>; }