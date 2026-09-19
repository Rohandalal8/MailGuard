"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { api, apiData } from "../lib/api";

export default function GmailConnect({ onChange, showDisconnect = false, hideWhenConnected = false }: { onChange: () => void; showDisconnect?: boolean; hideWhenConnected?: boolean }) {
    const { loading: authLoading } = useAuth();
    const autoSyncStarted = useRef(false);
    const [connected, setConnected] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [oauthSyncing, setOauthSyncing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    async function sync() {
        setBusy(true);
        setMessage("");
        try {
            const data = await apiData<{ new: number; skipped: number }>(api.post("/gmail/sync"));
            setMessage(`${data.new} new emails analyzed${data.skipped ? `; ${data.skipped} skipped because AI analysis failed.` : "."}`);
            setCompleted(true);
            setOauthSyncing(false);
            onChange();
        } catch (error) {
            setOauthSyncing(false);
            const serverMessage = axios.isAxiosError(error) ? error.response?.data?.message : null;
            setMessage(serverMessage ?? "Gmail sync failed. Check the backend and AI service.");
        } finally {
            setBusy(false);
        }
    }

    async function loadStatus() {
        try {
            const result = await apiData<{ connected: boolean }>(api.get("/gmail/status"));
            setConnected(result.connected);
            if (result.connected && new URLSearchParams(window.location.search).get("gmail") === "connected" && !autoSyncStarted.current) {
                autoSyncStarted.current = true;
                setOauthSyncing(true);
                window.history.replaceState({}, "", window.location.pathname);
                await sync();
            }
        } catch {
            setConnected(false);
        }
    }

    async function connect() {
        setBusy(true);
        setMessage("");
        try {
            const data = await apiData<{ authorizationUrl: string }>(api.get("/gmail/connect"));
            window.location.assign(data.authorizationUrl);
        } catch {
            setMessage("Gmail connection requires an active backend login session.");
            setBusy(false);
        }
    }

    async function disconnect() {
        setBusy(true);
        setMessage("");
        try {
            await api.post("/gmail/disconnect");
            setConnected(false);
            setCompleted(false);
            setMessage("Gmail disconnected.");
            window.dispatchEvent(new Event("dashboard-stats-updated"));
            onChange();
        } catch (error) {
            const serverMessage = axios.isAxiosError(error) ? error.response?.data?.message : null;
            setMessage(serverMessage ?? "Gmail disconnect failed.");
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        if (!authLoading) void loadStatus();
    }, [authLoading]);

    if (hideWhenConnected && connected && !oauthSyncing) return null;

    return (
        <div className="panel">
            <div className="eyebrow">Gmail access</div>
            <h2>Connect your mailbox</h2>
            <p className="muted">Read-only access is used to classify new messages. Refresh tokens stay on the backend.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!completed &&
                    <button
                        className="button"
                        disabled={busy || authLoading}
                        onClick={() => void (connected ? sync() : connect())}>
                        {busy ? (connected ? "Scanning..." : "Opening Google...") : (connected ? "Sync Gmail" : "Connect & Sync Gmail")}
                    </button>
                }
                {showDisconnect && connected &&
                    <button
                        className="button secondary"
                        disabled={busy || authLoading}
                        onClick={() => void disconnect()}>
                        Disconnect
                    </button>
                }
            </div>
            {message &&
                <p className="muted">{message}</p>
            }
        </div>
    );
}