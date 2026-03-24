"use client";

import { useState } from "react";

import type { FieldUploadRow } from "@/types/db";

type Props = { row: FieldUploadRow };

export function FieldUploadArchiveCard({ row }: Props) {
  const [copied, setCopied] = useState<"cap" | "hash" | null>(null);

  const created = new Date(row.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  async function copy(text: string, kind: "cap" | "hash") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="animate-fade-up"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "4px 1fr",
      }}
    >
      <div style={{ background: "var(--gold)" }} />
      <div style={{ padding: "1rem 1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "0.75rem",
            overflow: "hidden",
            flexShrink: 0,
            background: "var(--navy)",
            border: "1px solid var(--border)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.9rem", color: "var(--navy)" }}>
              Field capture
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--muted-fg)" }}>{created}</span>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "0.1rem 0.45rem",
                borderRadius: "9999px",
                background: "rgba(255,88,51,0.12)",
                color: "var(--accent)",
              }}
            >
              {row.status}
            </span>
          </div>
          {row.raw_notes && (
            <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)", margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: "var(--navy)" }}>Notes:</strong> {row.raw_notes}
            </p>
          )}
          {row.generated_caption && (
            <p style={{ fontSize: "0.82rem", color: "var(--navy)", margin: 0, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
              {row.generated_caption}
            </p>
          )}
          {row.hashtags && (
            <p style={{ fontSize: "0.75rem", color: "var(--muted-fg)", margin: 0, lineHeight: 1.45, wordBreak: "break-word" }}>
              {row.hashtags}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            {row.generated_caption && (
              <button
                type="button"
                onClick={() => copy(row.generated_caption!, "cap")}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "0.625rem",
                  border: "1.5px solid var(--border)",
                  background: "transparent",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-syne)",
                  cursor: "pointer",
                  color: "var(--navy)",
                }}
              >
                {copied === "cap" ? "Copied caption" : "Copy caption"}
              </button>
            )}
            {row.hashtags && (
              <button
                type="button"
                onClick={() => copy(row.hashtags!, "hash")}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "0.625rem",
                  border: "1.5px solid var(--border)",
                  background: "transparent",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-syne)",
                  cursor: "pointer",
                  color: "var(--navy)",
                }}
              >
                {copied === "hash" ? "Copied hashtags" : "Copy hashtags"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
