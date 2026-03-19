"use client";

import { useState } from "react";

export function HistoryDownloadButton({ runId, label }: { runId: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`/api/history/${runId}/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const posts = await res.json() as Array<{
        platform: string;
        framework_used: string;
        cta_used: string;
        post_index: number;
        content: string;
        image_suggestion: string;
      }>;

      const headers = ["Post #", "Platform", "Framework", "Content", "CTA", "Image Suggestion"];
      const rows = posts.map((p, i) => [
        String(i + 1),
        p.platform.replace(/_/g, " "),
        p.framework_used,
        p.content,
        p.cta_used,
        p.image_suggestion,
      ]);
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beyond-booked-${label.toLowerCase().replace(/\s+/g, "-")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not download — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={() => void download()}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.45rem 0.875rem",
        borderRadius: "0.625rem",
        border: "1.5px solid var(--border)",
        background: "var(--card)",
        color: "var(--navy)",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {loading ? "…" : "↓ CSV"}
    </button>
  );
}
