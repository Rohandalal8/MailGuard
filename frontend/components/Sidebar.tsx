"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { DashboardStats } from "../types/analysis";

export default function Sidebar({ stats }: { stats?: DashboardStats | null }) {
  const path = usePathname();
  const [serviceStatus, setServiceStatus] = useState<"down" | "partial" | "up">("down");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  const backendHealthUrl = `${apiUrl.replace(/\/api\/?$/, "")}/health`;
  const aiHealthUrl = `${(process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "http://localhost:8000").replace(/\/$/, "")}/health`;

  useEffect(() => {
    let mounted = true;

    const checkServices = async () => {
      const results = await Promise.allSettled([
        fetch(backendHealthUrl, { cache: "no-store" }),
        fetch(aiHealthUrl, { cache: "no-store" }),
      ]);
      const healthyServices = results.filter(
        (result) => result.status === "fulfilled" && result.value.ok,
      ).length;

      if (mounted) {
        setServiceStatus(healthyServices === 2 ? "up" : healthyServices === 1 ? "partial" : "down");
      }
    };

    void checkServices();
    const interval = window.setInterval(() => void checkServices(), 10_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [aiHealthUrl, backendHealthUrl]);

  const items = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/inbox", label: "Inbox", count: stats?.INBOX },
    { href: "/spam", label: "Spam", count: stats?.SPAM },
    { href: "/scam", label: "Scam", count: stats?.SCAM },
    { href: "/settings", label: "Settings" }
  ];

  return (
    <aside className="sidebar">
      <p className="brand">
        MAILGUARD
        <span className={`service-dot service-dot-${serviceStatus}`} aria-label={`Services ${serviceStatus}`} title={`Services ${serviceStatus}`} />
      </p>
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