import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MailGuard AI",
  description: "AI-powered Gmail security",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
