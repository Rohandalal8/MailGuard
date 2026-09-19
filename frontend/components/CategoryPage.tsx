"use client";
import { useEffect, useState } from "react";
import AppShell from "./AppShell";
import EmailList from "./EmailList";
import { api, apiData } from "../lib/api";
import type { Category, PaginatedEmails } from "../types/email";

export default function CategoryPage({ category, title, empty }: { category: Category; title: string; empty: string }) {
    const [data, setData] = useState<PaginatedEmails | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        let active = true;
        const loadEmails = async () => {
            try {
                const result = await apiData<PaginatedEmails>(api.get(`/emails?category=${category}&page=${page}&limit=20&search=${encodeURIComponent(search)}`));
                if (active) setData(result);
            } catch {
                if (active) setData({ emails: [], page, limit: 20, total: 0, totalPages: 0 });
            }
        };
        void loadEmails();
        // Set up a timer to refresh the emails every 10 seconds
        const intervalId = window.setInterval(() => void loadEmails(), 10_000);
        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, [category, page, search]);

    return (
        <AppShell>
            <div className="eyebrow">Mailbox</div>
            <h1>{title}</h1>
            <div className="section">
                <input
                    className="input"
                    value={search}
                    onChange={(event) => { setPage(1); setSearch(event.target.value); }}
                    placeholder="Search sender or subject"
                />
            </div>
            <section className="section">
                {data?.emails.length ?
                    <EmailList emails={data.emails} /> :
                    <div className="panel">
                        <p className="muted">{empty}</p>
                    </div>
                }
                {data && data.totalPages > 1 &&
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                        <button className="button secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                        <button className="button secondary" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</button>
                    </div>
                }
            </section>
        </AppShell>);
}