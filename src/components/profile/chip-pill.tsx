"use client";

import React from "react";

type ChipPillProps = {
  label: string;
  onRemove?: () => void;
  color?: "navy" | "gold";
};

export function ChipPill({ label, onRemove, color = "navy" }: ChipPillProps) {
  const isGold = color === "gold";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.3rem 0.75rem",
        borderRadius: "9999px",
        border: `1.5px solid ${isGold ? "var(--gold)" : "var(--navy)"}`,
        background: isGold ? "rgba(221,171,44,0.1)" : "var(--navy)",
        color: isGold ? "#8a6200" : "#fff",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: isGold ? "rgba(138,98,0,0.15)" : "rgba(255,255,255,0.2)",
            color: isGold ? "#8a6200" : "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "0.6rem",
            fontWeight: 700,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ✕
        </button>
      )}
    </span>
  );
}
