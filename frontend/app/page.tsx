import Link from "next/link";

export default function Home() {
    return (
        <main className="login">
        <section className="panel" style={{ maxWidth: 620, margin: 20 }}>
            <div className="eyebrow">MailGuard</div>
            <h1>Make your inbox less dangerous.</h1>
            <p className="muted pb-3" style={{ fontSize: 18, lineHeight: 1.6 }}>
                A private security desk for Gmail that separates normal mail, spam, and phishing threats with explainable analysis.
            </p>
            <Link className="button" href="/login">Open security desk</Link>
        </section>
        </main>
    );
}
