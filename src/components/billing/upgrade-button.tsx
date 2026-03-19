"use client";

import { useState } from "react";

export function UpgradeButton({ label = "Get full access →" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text) as { url?: string; error?: string };
      } catch {
        alert("Server error: " + text.slice(0, 200));
        setLoading(false);
        return;
      }
      if (data.error) {
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }
      if (!data.url) {
        alert("No checkout URL returned. Status: " + res.status);
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      alert("Fetch failed: " + String(err));
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
