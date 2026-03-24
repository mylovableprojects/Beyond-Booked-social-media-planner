"use client";

import { useState, type CSSProperties } from "react";

import type { FieldUploadRow } from "@/types/db";

type Props = { row: FieldUploadRow };

type CopiedKind = "cap" | "hash" | "photoUrl" | "pageUrl" | "photoClip" | null;

export function FieldUploadArchiveCard({ row }: Props) {
  const [copied, setCopied] = useState<CopiedKind>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const created = new Date(row.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const sharePath = `/share/field/${row.id}`;
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : sharePath;

  async function copy(text: string, kind: CopiedKind) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function downloadImage() {
    setBusy("img");
    try {
      const res = await fetch(row.photo_url, { mode: "cors" });
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
      a.download = `field-photo-${row.id.slice(0, 8)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Could not download the photo. Try Copy image link and open it in a new tab.");
    } finally {
      setBusy(null);
    }
  }

  async function copyImageToClipboard() {
    setBusy("clip");
    try {
      const res = await fetch(row.photo_url, { mode: "cors" });
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/png";
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
      setCopied("photoClip");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.alert("Could not copy the image. Try Download photo or Copy image link.");
    } finally {
      setBusy(null);
    }
  }

  async function downloadHtmlFile() {
    setBusy("html");
    try {
      const res = await fetch(sharePath);
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `field-capture-${row.id.slice(0, 8)}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Could not download the HTML file. Try Open HTML page and use Save As.");
    } finally {
      setBusy(null);
    }
  }

  const btnBase: CSSProperties = {
    padding: "0.4rem 0.85rem",
    borderRadius: "0.625rem",
    border: "1.5px solid var(--border)",
    background: "transparent",
    fontSize: "0.75rem",
    fontWeight: 700,
    fontFamily: "var(--font-syne)",
    cursor: "pointer",
    color: "var(--navy)",
  };

  const primaryBtn: CSSProperties = {
    ...btnBase,
    border: "1.5px solid var(--accent)",
    background: "var(--accent)",
    color: "#fff",
  };

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
              <button type="button" onClick={() => copy(row.generated_caption!, "cap")} style={btnBase}>
                {copied === "cap" ? "Copied caption" : "Copy caption"}
              </button>
            )}
            {row.hashtags && (
              <button type="button" onClick={() => copy(row.hashtags!, "hash")} style={btnBase}>
                {copied === "hash" ? "Copied hashtags" : "Copy hashtags"}
              </button>
            )}
          </div>

          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-fg)", margin: "0.5rem 0 0" }}>
            Photo &amp; HTML page
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" onClick={() => copy(row.photo_url, "photoUrl")} style={btnBase} disabled={busy !== null}>
              {copied === "photoUrl" ? "Copied link" : "Copy image link"}
            </button>
            <button type="button" onClick={() => void downloadImage()} style={btnBase} disabled={busy !== null}>
              {busy === "img" ? "…" : "Download photo"}
            </button>
            <button type="button" onClick={() => void copyImageToClipboard()} style={btnBase} disabled={busy !== null}>
              {busy === "clip" ? "…" : copied === "photoClip" ? "Copied photo" : "Copy photo"}
            </button>
            <button
              type="button"
              onClick={() => window.open(sharePath, "_blank", "noopener,noreferrer")}
              style={primaryBtn}
              disabled={busy !== null}
            >
              Open HTML page
            </button>
            <button type="button" onClick={() => copy(shareUrl, "pageUrl")} style={btnBase} disabled={busy !== null}>
              {copied === "pageUrl" ? "Copied link" : "Copy page link"}
            </button>
            <button type="button" onClick={() => void downloadHtmlFile()} style={btnBase} disabled={busy !== null}>
              {busy === "html" ? "…" : "Download HTML"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
