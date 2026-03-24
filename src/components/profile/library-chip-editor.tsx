"use client";

import React, { useMemo, useState } from "react";
import { ChipPill } from "./chip-pill";

function splitListInput(value: string) {
  return value.split(/[\n,]/g).map((item) => item.trim()).filter(Boolean);
}

type LibraryChipEditorProps = {
  label: string;
  selected: string[];
  defaultOptions: readonly string[];
  customAddPlaceholder: string;
  onChange: (next: string[]) => void;
  accentColor?: "navy" | "gold";
};

export function LibraryChipEditor({
  label,
  selected,
  defaultOptions,
  customAddPlaceholder,
  onChange,
  accentColor = "navy",
}: LibraryChipEditorProps) {
  const isGold = accentColor === "gold";

  const defaultCanonMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of defaultOptions) map.set(item.toLowerCase(), item);
    return map;
  }, [defaultOptions]);

  const normalizedSelected = useMemo(() => {
    const map = new Map<string, string>();
    for (const raw of selected) {
      const item = raw.trim();
      if (!item) continue;
      const lower = item.toLowerCase();
      const canonical = defaultCanonMap.get(lower) ?? item;
      map.set(lower, canonical);
    }
    return Array.from(map.values());
  }, [selected, defaultCanonMap]);

  const selectedLowerSet = useMemo(
    () => new Set(normalizedSelected.map((s) => s.toLowerCase())),
    [normalizedSelected],
  );

  const customSelected = useMemo(
    () => normalizedSelected.filter((item) => !defaultCanonMap.has(item.toLowerCase())),
    [normalizedSelected, defaultCanonMap],
  );

  const [customInput, setCustomInput] = useState("");

  const toggleDefault = (value: string) => {
    const lower = value.toLowerCase();
    const active = selectedLowerSet.has(lower);
    if (active) {
      onChange(normalizedSelected.filter((s) => s.toLowerCase() !== lower));
    } else {
      onChange([...normalizedSelected, value]);
    }
  };

  const addCustom = (rawValue: string) => {
    const items = splitListInput(rawValue);
    if (!items.length) return;
    const nextMap = new Map<string, string>();
    for (const s of normalizedSelected) nextMap.set(s.toLowerCase(), s);
    for (const raw of items) {
      const item = raw.trim();
      if (!item) continue;
      const lower = item.toLowerCase();
      const canonical = defaultCanonMap.get(lower) ?? item;
      if (!nextMap.has(lower)) nextMap.set(lower, canonical);
    }
    onChange(Array.from(nextMap.values()));
    setCustomInput("");
  };

  const removeSelected = (value: string) => {
    const lower = value.toLowerCase();
    onChange(normalizedSelected.filter((s) => s.toLowerCase() !== lower));
  };

  const activeColor = isGold ? "var(--gold)" : "var(--navy)";
  const activeBg = isGold ? "rgba(221,171,44,0.12)" : "var(--navy)";
  const activeText = isGold ? "#8a6200" : "#fff";

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "var(--muted-fg)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            padding: "0.1rem 0.5rem",
            borderRadius: "9999px",
            background: activeBg,
            color: activeText,
            fontSize: "0.65rem",
            fontWeight: 700,
            border: `1px solid ${activeColor}`,
          }}
        >
          {normalizedSelected.length}
        </span>
      </div>

      {/* Default chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
        {defaultOptions.map((opt) => {
          const active = selectedLowerSet.has(opt.toLowerCase());
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleDefault(opt)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "9999px",
                border: `1.5px solid ${active ? activeColor : "var(--border)"}`,
                background: active ? activeBg : "transparent",
                color: active ? activeText : "var(--muted-fg)",
                fontSize: "0.72rem",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Custom selected chips */}
      {customSelected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
          {customSelected.map((item) => (
            <ChipPill key={item} label={item} onRemove={() => removeSelected(item)} color={accentColor} />
          ))}
        </div>
      )}

      {/* Add custom input */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom(customInput);
            }
          }}
          placeholder={customAddPlaceholder}
          style={{
            flex: 1,
            borderRadius: "0.625rem",
            border: "1px solid var(--border)",
            background: "var(--muted)",
            color: "var(--navy)",
            padding: "0.5rem 0.75rem",
            fontSize: "0.78rem",
            fontFamily: "var(--font-dm-sans)",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => addCustom(customInput)}
          disabled={!customInput.trim()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.625rem",
            border: `1.5px solid ${activeColor}`,
            background: "transparent",
            color: activeText === "#fff" ? "var(--navy)" : activeText,
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: customInput.trim() ? "pointer" : "not-allowed",
            opacity: customInput.trim() ? 1 : 0.4,
            transition: "opacity 0.12s",
          }}
        >
          + Add
        </button>
      </div>
    </section>
  );
}
