"use client";

import { useState } from "react";

type Props = {
  /** Full URL including origin, e.g. https://app.example.com/dashboard/field-upload */
  fullUrl: string;
};

export function AdminFieldCaptureUrlCard({ fullUrl }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied — user can select the text */
    }
  }

  return (
    <div
      className="animate-fade-up mb-8 rounded-2xl border p-5"
      style={{
        borderColor: "var(--border)",
        background: "linear-gradient(135deg, rgba(255,200,120,0.12) 0%, rgba(255,88,51,0.05) 100%)",
      }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--muted-fg)",
          marginBottom: "0.35rem",
        }}
      >
        Field capture (crew / drivers)
      </p>
      <h2
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.05rem",
          fontWeight: 800,
          color: "var(--navy)",
          marginBottom: "0.5rem",
        }}
      >
        Bookmark this link
      </h2>
      <p style={{ fontSize: "0.82rem", color: "var(--muted-fg)", lineHeight: 1.6, marginBottom: "0.9rem" }}>
        Share with setup crew or post in Slack. They&apos;ll log in with their own account. Add to Home Screen from
        this URL so the icon opens field capture.
      </p>
      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: "0.625rem",
          padding: "0.625rem 0.875rem",
          fontSize: "0.72rem",
          color: "var(--muted-fg)",
          wordBreak: "break-all",
          marginBottom: "0.85rem",
          fontFamily: "monospace",
        }}
      >
        {fullUrl}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <button type="button" className="admin-btn admin-btn-neutral" onClick={() => void copy()} style={{ background: "var(--navy)", color: "#fff", borderColor: "var(--navy)" }}>
          {copied ? "Copied!" : "Copy URL"}
        </button>
        <a
          href={fullUrl}
          className="admin-btn admin-btn-neutral"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
        >
          Open field capture
        </a>
      </div>
    </div>
  );
}
