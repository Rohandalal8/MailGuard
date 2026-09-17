import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f3ec" }}>
      <section className="panel" style={{ width: "min(820px, 100%)", padding: 28 }}>
        <div className="eyebrow">MailGuard</div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 16 }}>Privacy Policy</h1>

        <p className="muted" style={{ lineHeight: 1.7 }}>
          MailGuard is built to help users analyze their Gmail inbox for spam, scam, and suspicious content.
          We respect your privacy and limit personal data usage to the features you explicitly use.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>1. Information we collect</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          We may collect information required to operate the service, including your Google account identity,
          Gmail metadata needed to classify messages, email subject/body text for analysis, and technical details
          such as device type, browser, and request logs for reliability and security.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>2. How we use your information</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          We use your Gmail data only to provide inbox protection features, such as spam and scam classification,
          dashboard summaries, and security recommendations. We do not sell your personal data.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>3. Gmail permissions</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          MailGuard requests Gmail access only when you choose to connect your account. This access is used to read
          your messages for analysis and display summaries in the app. We do not use Gmail data for unrelated
          advertising or third-party tracking.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>4. Data retention</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          We retain email data only as long as needed to provide the service and support security analysis.
          You may disconnect your Gmail account or revoke access at any time from the app or your Google account settings.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>5. Security</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          We use Firebase and server-side security controls to protect authentication and data access. However, no
          system is completely risk-free, so we encourage users to keep their account credentials secure and review
          any third-party access granted to Gmail.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>6. Cookies and analytics</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          MailGuard may use necessary browser cookies or local session information for authentication and application
          stability. We do not rely on invasive advertising cookies for profiling.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>7. Contact</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          If you have questions about this Privacy Policy, contact the project owner through the support email listed
          in the app or repository contact details.
        </p>

        <div style={{ marginTop: 28 }}>
          <Link href="/login" className="button secondary" style={{ display: "inline-block", textDecoration: "none" }}>
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
