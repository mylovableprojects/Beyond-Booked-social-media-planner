"use client";

import { useState } from "react";

export function UpgradeButton({ label = "Get full access →" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={() => void handleUpgrade()}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: loading ? "rgba(255,88,51,0.6)" : "var(--accent)",
        color: "#fff",
        border: "none",
        borderRadius: "0.875rem",
        padding: "0.875rem 2rem",
        fontSize: "0.95rem",
        fontWeight: 700,
        fontFamily: "var(--font-syne)",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
      }}
    >
      {loading ? "Redirecting to checkout…" : label}
    </button>
  );
}
