"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { DashboardStats } from "../types/analysis";

export default function Sidebar({ stats }: { stats?: DashboardStats | null }) {
  const path = usePathname();
  const [serviceStatus, setServiceStatus] = useState<"down" | "partial" | "up">("down");
  const backendHealthUrl = "/api/health";

  useEffect(() => {
    let mounted = true;

    const checkServices = async () => {
      let backendUp = false;
      let aiUp = false;

      try {
        const response = await fetch(backendHealthUrl, { cache: "no-store" });
        const health = await response.json() as {
          data?: { services?: { backend?: string; ai?: string } };
        };
        backendUp = response.ok && health.data?.services?.backend === "ok";
        aiUp = response.ok && health.data?.services?.ai === "ok";
      } catch {
        backendUp = false;
        aiUp = false;
      }

      if (mounted) {
        setServiceStatus(backendUp && aiUp ? "up" : backendUp || aiUp ? "partial" : "down");
      }
    };

    void checkServices();
    const interval = window.setInterval(() => void checkServices(), 10_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [backendHealthUrl]);

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