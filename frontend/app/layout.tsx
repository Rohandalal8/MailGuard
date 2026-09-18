import type { Metadata } from "next";
import "./globals.css";
import ServiceWarmup from "../components/ServiceWarmup";

export const metadata: Metadata = {
  title: "MailGuard",
  description: "AI-powered Gmail security",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body><ServiceWarmup />{children}</body>
    </html>
  );
}
