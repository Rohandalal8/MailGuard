import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f3ec" }}>
      <section className="panel" style={{ width: "min(820px, 100%)", padding: 28 }}>
        <div className="eyebrow">MailGuard</div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 16 }}>Terms of Service</h1>

        <p className="muted" style={{ lineHeight: 1.7 }}>
          By using MailGuard, you agree to these Terms of Service. Please read them carefully before continuing.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>1. Service description</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          MailGuard provides email monitoring and analysis tools to help users detect spam, scam, and suspicious mail
          content in their Gmail inbox. The service is designed to assist in inbox protection and awareness.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>2. User responsibilities</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          You are responsible for the accuracy of the information you provide, the security of your Google account,
          and any actions taken based on MailGuard’s analysis. You must not use the service for malicious,
          fraudulent, or unlawful activity.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>3. Gmail access</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          By connecting Gmail, you authorize MailGuard to read the messages required for classification and risk review.
          This service does not grant permission to send emails, modify mail content, or perform unrelated account actions.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>4. No guarantee of perfect detection</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          MailGuard uses automated analysis and machine learning to classify messages. However, no security system is
          perfect, and results should be treated as a helpful signal rather than a guarantee of legitimacy or danger.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>5. Service availability</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          We aim to keep the service available, but we do not guarantee continuous uptime or uninterrupted access.
          Features may be updated, paused, or changed without prior notice.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>6. Limitation of liability</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          MailGuard is provided “as is” without warranties of any kind. We are not liable for indirect, incidental,
          or consequential damages arising from use of the service, including loss of data, business disruption, or
          misclassification of an email.
        </p>

        <h2 style={{ marginTop: 28, marginBottom: 12 }}>7. Changes to terms</h2>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          We may update these Terms of Service from time to time. Continued use of the service after changes are made
          indicates acceptance of the revised terms.
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
