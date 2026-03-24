"use client";

import { useMemo, useState } from "react";

import { ToastFeedback } from "@/components/layout/toast-feedback";
import type { Platform } from "@/types/platform";

const EXPORT_PLATFORMS: Array<{ platform: Platform; label: string }> = [
  { platform: "facebook", label: "Facebook CSV" },
  { platform: "instagram", label: "Instagram CSV" },
  { platform: "google_business_profile", label: "Google Business Profile CSV" },
];

function getFilenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^;"\n]+)("?;|\s|$)/i);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function HighLevelExportButtons({
  batchId,
  disabled = false,
}: {
  batchId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState<Partial<Record<Platform, boolean>>>({});
  const [toast, setToast] = useState<null | { variant: "success" | "error"; message: string }>(null);

  const canExport = useMemo(() => Boolean(batchId) && !disabled, [batchId, disabled]);

  const getLabelForPlatform = (p: Platform) => EXPORT_PLATFORMS.find((x) => x.platform === p)?.label ?? "CSV";

  const onDownload = async (platform: Platform) => {
    if (!canExport) return;
    setLoading((prev) => ({ ...prev, [platform]: true }));
    setToast(null);

    try {
      const res = await fetch("/api/export/highlevel-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, platform }),
      });

      if (!res.ok) {
        setToast({
          variant: "error",
          message: "HighLevel CSV export failed. Please try again.",
        });
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const fallbackName = `highlevel-${platform}-export.csv`;
      const filename = getFilenameFromDisposition(disposition, fallbackName);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1500);

      setToast({
        variant: "success",
        message: `${getLabelForPlatform(platform)} downloaded.`,
      });
    } catch {
      setToast({
        variant: "error",
        message: "HighLevel CSV export failed. Please try again.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [platform]: false }));
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
      {toast ? <ToastFeedback variant={toast.variant} message={toast.message} /> : null}
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.2rem" }}>
          HighLevel export
        </p>
        <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)" }}>
          Platform-specific CSVs for HighLevel CRM (v1 format).
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {EXPORT_PLATFORMS.map(({ platform, label }) => (
          <button
            key={platform}
            type="button"
            disabled={disabled || !!loading[platform] || !canExport}
            onClick={() => void onDownload(platform)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--navy)",
              background: "var(--navy)",
              color: "#fff",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: disabled || !!loading[platform] || !canExport ? "not-allowed" : "pointer",
              opacity: disabled || !canExport ? 0.4 : 1,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {loading[platform] ? "Preparing…" : `↓ ${label}`}
          </button>
        ))}
      </div>
    </div>
  );
}

