"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardStats } from "../types/analysis";

export default function Sidebar({ stats }: { stats?: DashboardStats | null }) {
  const path = usePathname();
  const items = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/inbox", label: "Inbox", count: stats?.INBOX },
    { href: "/spam", label: "Spam", count: stats?.SPAM },
    { href: "/scam", label: "Scam", count: stats?.SCAM },
    { href: "/settings", label: "Settings" }
  ];

  return (
    <aside className="sidebar">
      <p className="brand">MAILGUARD</p>
      <div></div>
      <nav className="nav">
        {items.map((item) => (
          <Link
            className={`nav-link ${path === item.href ? "active" : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.label}
            {item.count !== undefined ? `  ${item.count}` : ""}
          </Link>
        ))}
      </nav>
    </aside>
  );
}