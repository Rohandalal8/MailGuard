"use client";
import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import GmailConnect from "../../components/GmailConnect";
import { api, apiData } from "../../lib/api";

export default function SettingsPage() { const [status, setStatus] = useState<{ connected: boolean; gmailEmail: string | null } | null>(null); const [error, setError] = useState(""); const refresh = async () => { try { const result = await apiData<{ connected: boolean; gmailEmail: string | null }>(api.get("/gmail/status")); setStatus(result); setError(""); } catch { setError("Your account is not synchronized with the backend yet. Sign out and sign in again after PostgreSQL is running."); } }; useEffect(() => { void refresh(); }, []); return <AppShell><div className="eyebrow">Configuration</div><h1>Settings</h1>{error && <div className="panel section"><p style={{ color: "#9c2d20" }}>{error}</p></div>}<section className="section"><GmailConnect onChange={refresh} /></section><p className="muted">Status: {status?.connected ? `Connected as ${status.gmailEmail}` : "Not connected"}</p></AppShell>; }