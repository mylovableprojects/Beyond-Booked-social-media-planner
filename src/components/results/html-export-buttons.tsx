"use client";

import { useState } from "react";
import { ToastFeedback } from "@/components/layout/toast-feedback";

export function HtmlExportButtons({
  batchId,
  disabled = false,
}: {
  batchId: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<null | { variant: "success" | "error"; message: string }>(null);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${batchId}`
    : `/share/${batchId}`;

  const canExport = Boolean(batchId) && !disabled;

  const openPage = () => {
    if (!canExport) return;
    window.open(`/share/${batchId}`, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    if (!canExport) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setToast({ variant: "success", message: "Share link copied to clipboard!" });
      window.setTimeout(() => { setCopied(false); setToast(null); }, 2500);
    } catch {
      setToast({ variant: "error", message: "Could not copy link — try opening the page directly." });
    }
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 4px 16px rgba(16,23,44,0.05)",
      }}
    >
      {toast && (
        <div style={{ marginBottom: "0.75rem" }}>
          <ToastFeedback variant={toast.variant} message={toast.message} />
        </div>
      )}

      <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.2rem" }}>
        Share page
      </p>
      <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)", marginBottom: "1rem", lineHeight: 1.5 }}>
        A beautiful, bookmarkable page with all your posts — no login required.
      </p>

      {/* URL preview */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.625rem",
          background: "var(--muted)",
          border: "1px solid var(--border)",
          marginBottom: "0.875rem",
          overflow: "hidden",
        }}
      >
        <span style={{ fontSize: "0.7rem", color: "var(--muted-fg)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
          /share/{batchId}
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={!canExport}
          onClick={openPage}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            border: "1.5px solid var(--accent)",
            background: "var(--accent)",
            color: "#fff",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: !canExport ? "not-allowed" : "pointer",
            opacity: !canExport ? 0.4 : 1,
            fontFamily: "var(--font-dm-sans)",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          ↗ Open page
        </button>

        <button
          type="button"
          disabled={!canExport}
          onClick={() => void copyLink()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            border: "1.5px solid var(--border)",
            background: copied ? "var(--navy)" : "transparent",
            color: copied ? "#fff" : "var(--navy)",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: !canExport ? "not-allowed" : "pointer",
            opacity: !canExport ? 0.4 : 1,
            fontFamily: "var(--font-dm-sans)",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            transition: "all 0.15s ease",
          }}
        >
          {copied ? "✓ Copied!" : "⎘ Copy link"}
        </button>
      </div>
    </div>
  );
}
