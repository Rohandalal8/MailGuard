"use client";
import Link from "next/link";
import type { Email } from "../types/email";

export default function EmailList({ emails }: { emails: Email[] }) {

    return (
        <div className="panel">
            {emails.length === 0 ?
                <p className="muted">No emails found.</p> :
                emails.map((email) => (
                    <Link className="email-row" href={`/email/${email.id}`} key={email.id}>
                        <div>
                            <div className="muted">{email.sender} &lt;{email.senderEmail}&gt;</div>
                            <h3>{email.subject}</h3>
                            <div className="muted">{email.bodyPreview}</div>
                        </div>
                        <div>
                            <span className={`badge badge-${email.category}`}>{email.category}</span>
                            <div className="muted">{new Date(email.receivedAt).toLocaleDateString()}</div>
                        </div>
                    </Link>
                ))}
        </div>
    );
}