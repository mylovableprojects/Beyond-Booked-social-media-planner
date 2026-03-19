"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import { GenerationProgress } from "./generation-progress";
import { generatorRequestSchema } from "@/lib/validation/generator.schema";
import type { Platform } from "@/types/platform";
import type { GeneratedPost } from "@/types/content";
import { DEFAULT_EVENT_TYPES, DEFAULT_SERVICE_CATEGORIES } from "@/lib/constants/default-libraries";
import { ToastFeedback } from "@/components/layout/toast-feedback";

type GeneratorFormProps = {
  profileId: string;
  city: string;
  stateRegion: string | null;
  savedEventTypes: string[];
  savedServiceCategories: string[];
  isTrial?: boolean;
};

const PLATFORM_OPTIONS: Array<{ value: Platform; label: string; short: string }> = [
  { value: "facebook",               label: "Facebook",                short: "FB"  },
  { value: "instagram",              label: "Instagram",               short: "IG"  },
  { value: "google_business_profile",label: "Google Business Profile", short: "GBP" },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook:                "#1877f2",
  instagram:               "#e1306c",
  google_business_profile: "#34a853",
};

function toggleFromOptions(selected: string[], options: string[], rawValue: string) {
  const lower = rawValue.trim().toLowerCase();
  const canonicalMap = new Map(options.map((o) => [o.toLowerCase(), o]));
  const canonical = canonicalMap.get(lower) ?? rawValue.trim();
  const exists = selected.some((s) => s.toLowerCase() === lower);
  if (exists) return selected.filter((s) => s.toLowerCase() !== lower);
  return [...selected, canonical];
}

function joinZodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function SectionLabel({
  number,
  children,
  hint,
}: {
  number: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: hint ? "0.35rem" : 0 }}>
        <span
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.65rem",
            fontWeight: 800,
            color: "var(--accent)",
            letterSpacing: "0.08em",
            minWidth: 20,
          }}
        >
          {number}
        </span>
        <div style={{ height: 1, width: 20, background: "var(--border)" }} />
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "var(--muted-fg)",
          }}
        >
          {children}
        </span>
      </div>
      {hint && (
        <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)", lineHeight: 1.5, paddingLeft: "2.75rem" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function CopyLinkButton({ batchId }: { batchId: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(`${window.location.origin}/share/${batchId}`).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.625rem 1.25rem",
        borderRadius: "0.75rem",
        border: "1.5px solid var(--border)",
        background: copied ? "var(--navy)" : "var(--card)",
        color: copied ? "#fff" : "var(--navy)",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {copied ? "✓ Link copied!" : "⎘ Copy share link"}
    </button>
  );
}

export function GeneratorForm({
  profileId,
  city,
  stateRegion,
  savedEventTypes,
  savedServiceCategories,
  isTrial = false,
}: GeneratorFormProps) {
  const currentDate = useMemo(() => new Date(), []);
  const defaultMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const yearStart = Math.max(2025, currentYear - 2);
  const yearEnd = Math.min(2100, currentYear + 5);

  const eventTypeOptions = useMemo(
    () => (savedEventTypes.length ? savedEventTypes : [...DEFAULT_EVENT_TYPES]),
    [savedEventTypes],
  );
  const serviceCategoryOptions = useMemo(
    () => (savedServiceCategories.length ? savedServiceCategories : [...DEFAULT_SERVICE_CATEGORIES]),
    [savedServiceCategories],
  );

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(() =>
    PLATFORM_OPTIONS.map((p) => p.value),
  );
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [month, setMonth] = useState<number>(defaultMonth);
  const [year, setYear] = useState<number>(currentYear);
  const [postCount, setPostCount] = useState<1 | 3 | 9>(isTrial ? 3 : 9);
  const [promoText, setPromoText] = useState<string>("");
  const [featuredProduct, setFeaturedProduct] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [trialLimitHit, setTrialLimitHit] = useState(false);
  const [monthlyCapHit, setMonthlyCapHit] = useState<{ used: number; cap: number } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);

  const canGenerate =
    selectedPlatforms.length > 0 &&
    selectedEventTypes.length > 0 &&
    selectedServiceCategories.length > 0;

  const onGenerate = async () => {
    setSubmitError(null);
    setSubmitMessage(null);
    setRunning(true);
    setFieldErrors({});

    const payload = {
      platforms: selectedPlatforms,
      eventTypes: selectedEventTypes,
      serviceCategories: selectedServiceCategories,
      month,
      year,
      postCount,
      promoText: promoText.trim() ? promoText.trim() : undefined,
      featuredProduct: featuredProduct.trim() ? featuredProduct.trim() : undefined,
      profileId,
      city,
      stateRegion,
    };

    const parsed = generatorRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(joinZodErrors(parsed.error));
      setRunning(false);
      return;
    }

    try {
      const res = await fetch("/api/generator/create-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as { ok?: boolean; posts?: GeneratedPost[]; batchId?: string | null; error?: string; used?: number; cap?: number };
      if (result.error === "trial_limit") {
        setTrialLimitHit(true);
        return;
      }
      if (result.error === "monthly_cap") {
        setMonthlyCapHit({ used: result.used ?? 27, cap: result.cap ?? 27 });
        return;
      }
      if (!res.ok || !result.ok) {
        setSubmitError("Something went wrong generating your posts. Please try again — if it keeps happening, reach out and we'll sort it out.");
        return;
      }

      setGeneratedPosts(result.posts ?? []);
      setBatchId(result.batchId ?? null);
      setSubmitMessage(`${result.posts?.length ?? 0} posts generated.`);
    } catch {
      setSubmitError("Something went wrong generating your posts. Please try again — if it keeps happening, reach out and we'll sort it out.");
    } finally {
      setRunning(false);
    }
  };

  const selectStyle = {
    width: "100%",
    borderRadius: "0.75rem",
    border: "1px solid var(--border)",
    background: "var(--muted)",
    color: "var(--navy)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    fontFamily: "var(--font-dm-sans)",
    cursor: "pointer",
    outline: "none",
  };

  const inputStyle = {
    width: "100%",
    borderRadius: "0.75rem",
    border: "1px solid var(--border)",
    background: "var(--muted)",
    color: "var(--navy)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    fontFamily: "var(--font-dm-sans)",
    outline: "none",
  };

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .gen-submit-bar { flex-direction: column !important; align-items: stretch !important; }
          .gen-submit-bar button[type="submit"] { width: 100% !important; justify-content: center !important; }
          .gen-submit-count { text-align: center; }
          .gen-optional-grid { grid-template-columns: 1fr !important; }
          .gen-card-header { padding: 1rem 1.25rem !important; }
          .gen-form-body { padding: 1.25rem !important; }
          .gen-results-header { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* ── Trial limit banner ── */}
      {trialLimitHit && (
        <div
          className="animate-fade-up"
          style={{
            background: "var(--navy)",
            border: "1.5px solid rgba(255,88,51,0.3)",
            borderRadius: "1.5rem",
            padding: "2.5rem",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56, height: 56,
              borderRadius: "50%",
              background: "rgba(255,88,51,0.12)",
              border: "1.5px solid rgba(255,88,51,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: "1.5rem",
            }}
          >
            🔒
          </div>
          <h3
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "0.625rem",
            }}
          >
            You&apos;ve used your free trial run.
          </h3>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 400, margin: "0 auto 1.75rem" }}>
            Now you know what it can do. Upgrade to keep generating posts every month — unlimited runs, all 4 frameworks, all 3 platforms.
          </p>
          <a
            href="mailto:hello@partyrentaltoolkit.com?subject=Upgrade my account"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: "0.875rem",
              padding: "0.75rem 1.75rem",
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: "var(--font-syne)",
              textDecoration: "none",
            }}
          >
            Get full access →
          </a>
          <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
            Questions? Reply to your welcome email or reach out directly.
          </p>
        </div>
      )}

      {/* ── Monthly cap banner ── */}
      {monthlyCapHit && (
        <div
          className="animate-fade-up"
          style={{
            background: "var(--navy)",
            border: "1.5px solid rgba(221,171,44,0.3)",
            borderRadius: "1.5rem",
            padding: "2.5rem",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(221,171,44,0.12)", border: "1.5px solid rgba(221,171,44,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.5rem" }}>
            📅
          </div>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.25rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.625rem" }}>
            You&apos;ve hit your monthly limit.
          </h3>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 420, margin: "0 auto 1.75rem" }}>
            You&apos;ve used {monthlyCapHit.used} of {monthlyCapHit.cap} posts this month. Your limit resets on the 1st — or reach out to upgrade to a higher plan.
          </p>
          <a
            href="mailto:hello@beyondbooked.com?subject=Upgrade my account"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--gold)", color: "#fff", borderRadius: "0.875rem", padding: "0.75rem 1.75rem", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-syne)", textDecoration: "none" }}
          >
            Talk to us about upgrading →
          </a>
        </div>
      )}

      {/* ── Main form card ── */}
      <div
        className="animate-fade-up"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 40px rgba(16,23,44,0.08)",
          overflow: "hidden",
          opacity: trialLimitHit || monthlyCapHit ? 0.4 : 1,
          pointerEvents: trialLimitHit || monthlyCapHit ? "none" : "auto",
        }}
      >
        {/* Card header bar */}
        <div
          className="gen-card-header"
          style={{
            background: "var(--navy)",
            padding: "1.25rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              Configure your run
            </h2>
            <GenerationProgress running={running} />
          </div>
          {running && (
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
              This takes about 10 seconds…
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); void onGenerate(); }}
          className="gen-form-body"
          style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}
        >
          {/* 01 — Platforms */}
          <section>
            <SectionLabel
              number="01"
              hint="Choose which social channels to generate for. You can mix and match — we'll write platform-specific copy for each one you activate."
            >
              Platforms
            </SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {PLATFORM_OPTIONS.map((opt) => {
                const active = selectedPlatforms.some((p) => p === opt.value);
                const platformColor = PLATFORM_COLORS[opt.value];
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={running}
                    onClick={() =>
                      setSelectedPlatforms((prev) => {
                        const exists = prev.includes(opt.value);
                        return exists ? prev.filter((p) => p !== opt.value) : [...prev, opt.value];
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.625rem 1.125rem",
                      borderRadius: "0.875rem",
                      border: `2px solid ${active ? platformColor : "var(--border)"}`,
                      background: active ? platformColor : "var(--muted)",
                      color: active ? "#fff" : "var(--muted-fg)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: running ? "not-allowed" : "pointer",
                      opacity: running ? 0.6 : 1,
                      transition: "all 0.15s ease",
                      minWidth: 140,
                    }}
                  >
                    {/* Checkmark or dot */}
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: active ? "rgba(255,255,255,0.25)" : "transparent",
                        border: active ? "none" : `1.5px solid var(--border)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.6rem",
                        color: "#fff",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {active ? "✓" : ""}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {selectedPlatforms.length > 0 && (
              <p style={{ marginTop: "0.625rem", fontSize: "0.72rem", color: "var(--muted-fg)" }}>
                <span style={{ color: "var(--navy)", fontWeight: 700 }}>{selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} active</span>
                {" "}— posts will be written separately for each one
              </p>
            )}
            {selectedPlatforms.length === 0 && (
              <p style={{ marginTop: "0.625rem", fontSize: "0.72rem", color: "#dc2626" }}>
                Select at least one platform to continue
              </p>
            )}
            {fieldErrors.platforms && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#dc2626" }}>{fieldErrors.platforms}</p>
            )}
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "-0.5rem 0" }} />

          {/* 02 — Event types */}
          <section>
            <SectionLabel
              number="02"
              hint="Pick 2–3 event types to focus on this run. Don't select everything — a tighter focus means more relevant, specific posts. Rotate your selection each time you generate."
            >
              Event types
            </SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {eventTypeOptions.map((opt) => {
                const active = selectedEventTypes.some((s) => s.toLowerCase() === opt.toLowerCase());
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={running}
                    onClick={() => setSelectedEventTypes((prev) => toggleFromOptions(prev, eventTypeOptions, opt))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "0.625rem",
                      border: `2px solid ${active ? "var(--navy)" : "var(--border)"}`,
                      background: active ? "var(--navy)" : "var(--muted)",
                      color: active ? "#fff" : "var(--muted-fg)",
                      fontSize: "0.78rem",
                      fontWeight: active ? 600 : 500,
                      cursor: running ? "not-allowed" : "pointer",
                      opacity: running ? 0.6 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: active ? "rgba(255,255,255,0.2)" : "transparent",
                        border: active ? "none" : "1.5px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.5rem",
                        color: "#fff",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {active ? "✓" : ""}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.72rem", color: selectedEventTypes.length > 3 ? "var(--gold)" : "var(--muted-fg)" }}>
                {selectedEventTypes.length === 0
                  ? "Select 2–3 event types above"
                  : selectedEventTypes.length <= 3
                    ? <><span style={{ color: "var(--navy)", fontWeight: 700 }}>{selectedEventTypes.length}</span> selected — good focus</>
                    : <><span style={{ fontWeight: 700, color: "#8a6200" }}>{selectedEventTypes.length} selected</span> — consider narrowing to 2–3 for tighter posts</>
                }
              </span>
            </div>
            {fieldErrors.eventTypes && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#dc2626" }}>{fieldErrors.eventTypes}</p>
            )}
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "-0.5rem 0" }} />

          {/* 03 — Service categories */}
          <section>
            <SectionLabel
              number="03"
              hint="Choose 2–3 categories to spotlight this batch. Rotating different categories each run keeps your feed fresh and covers your full inventory over time."
            >
              Service categories
            </SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {serviceCategoryOptions.map((opt) => {
                const active = selectedServiceCategories.some((s) => s.toLowerCase() === opt.toLowerCase());
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={running}
                    onClick={() =>
                      setSelectedServiceCategories((prev) =>
                        toggleFromOptions(prev, serviceCategoryOptions, opt),
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "0.625rem",
                      border: `2px solid ${active ? "var(--gold)" : "var(--border)"}`,
                      background: active ? "rgba(221,171,44,0.12)" : "var(--muted)",
                      color: active ? "#8a6200" : "var(--muted-fg)",
                      fontSize: "0.78rem",
                      fontWeight: active ? 600 : 500,
                      cursor: running ? "not-allowed" : "pointer",
                      opacity: running ? 0.6 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: active ? "rgba(138,98,0,0.15)" : "transparent",
                        border: active ? "none" : "1.5px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.5rem",
                        color: "#8a6200",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {active ? "✓" : ""}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.72rem", color: selectedServiceCategories.length > 3 ? "var(--gold)" : "var(--muted-fg)" }}>
                {selectedServiceCategories.length === 0
                  ? "Select 2–3 service categories above"
                  : selectedServiceCategories.length <= 3
                    ? <><span style={{ color: "var(--navy)", fontWeight: 700 }}>{selectedServiceCategories.length}</span> selected — good focus</>
                    : <><span style={{ fontWeight: 700, color: "#8a6200" }}>{selectedServiceCategories.length} selected</span> — consider narrowing to 2–3 for tighter posts</>
                }
              </span>
            </div>
            {fieldErrors.serviceCategories && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#dc2626" }}>{fieldErrors.serviceCategories}</p>
            )}
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "-0.5rem 0" }} />

          {/* 04 — Schedule & volume */}
          <section>
            <SectionLabel
              number="04"
              hint={`Set the month, year, and how many posts to create per platform. ${postCount} post${postCount !== 1 ? "s" : ""} × ${selectedPlatforms.length || 1} platform${(selectedPlatforms.length || 1) !== 1 ? "s" : ""} = ${postCount * (selectedPlatforms.length || 1)} total posts ready to schedule.`}
            >
              Schedule &amp; volume
            </SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                  Month
                </span>
                <select value={month} disabled={running} onChange={(e) => setMonth(Number(e.target.value))} style={selectStyle}>
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const value = idx + 1;
                    const label = new Date(2000, idx, 1).toLocaleString(undefined, { month: "long" });
                    return <option key={value} value={value}>{label}</option>;
                  })}
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                  Year
                </span>
                <select value={year} disabled={running} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
                  {Array.from({ length: yearEnd - yearStart + 1 }).map((_, i) => {
                    const y = yearStart + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                  Posts
                </span>
                <select value={postCount} disabled={running} onChange={(e) => setPostCount(Number(e.target.value) as 1 | 3 | 9)} style={selectStyle}>
                  {(isTrial ? [1, 3] : [1, 3, 9]).map((n) => (
                    <option key={n} value={n}>{n} post{n !== 1 ? "s" : ""} per platform{isTrial && n === 3 ? " (trial max)" : ""}</option>
                  ))}
                </select>
              </label>
            </div>
            {(fieldErrors.month || fieldErrors.year || fieldErrors.postCount) && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#dc2626" }}>
                {fieldErrors.month || fieldErrors.year || fieldErrors.postCount}
              </p>
            )}
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "-0.5rem 0" }} />

          {/* 05 — Optional boosts */}
          <section>
            <SectionLabel number="05">Optional boosts</SectionLabel>
            <div className="gen-optional-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                  Special promotion
                </span>
                <input
                  value={promoText}
                  disabled={running}
                  onChange={(e) => setPromoText(e.target.value)}
                  style={{ ...inputStyle, opacity: running ? 0.6 : 1 }}
                  placeholder="10% off weekday rentals this month"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                  Featured product
                </span>
                <input
                  value={featuredProduct}
                  disabled={running}
                  onChange={(e) => setFeaturedProduct(e.target.value)}
                  style={{ ...inputStyle, opacity: running ? 0.6 : 1 }}
                  placeholder="18' Tropical Water Slide"
                />
              </label>
            </div>
          </section>

          {/* Feedback */}
          {submitError && <ToastFeedback variant="error" message={submitError} />}
          {submitMessage && <ToastFeedback variant="success" message={submitMessage} />}

          {/* Submit bar */}
          <div
            className="gen-submit-bar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border)",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div className="gen-submit-count" style={{ fontSize: "0.8rem", color: "var(--muted-fg)", lineHeight: 1.5 }}>
              {selectedPlatforms.length > 0 ? (
                <>
                  <span style={{ color: "var(--navy)", fontWeight: 700 }}>{postCount} posts</span>
                  {" per platform × "}
                  <span style={{ color: "var(--navy)", fontWeight: 700 }}>
                    {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""}
                  </span>
                  {" = "}
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                    {postCount * selectedPlatforms.length} total posts
                  </span>
                </>
              ) : (
                <span style={{ color: "#dc2626" }}>Select at least one platform to continue</span>
              )}
            </div>
            <button
              type="submit"
              disabled={!canGenerate || running}
              style={{
                background: canGenerate && !running ? "var(--accent)" : "var(--border)",
                color: canGenerate && !running ? "#fff" : "var(--muted-fg)",
                border: "none",
                borderRadius: "0.875rem",
                padding: "0.75rem 2rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                fontFamily: "var(--font-syne)",
                letterSpacing: "0.01em",
                cursor: canGenerate && !running ? "pointer" : "not-allowed",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {running ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "0.85rem" }}>⟳</span>
                  Generating…
                </>
              ) : (
                <>
                  Generate content
                  <span style={{ opacity: 0.7 }}>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Generated posts ── */}
      {generatedPosts.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          {/* Results header */}
          <div
            className="gen-results-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                <div style={{ width: 24, height: 3, background: "var(--accent)", borderRadius: 2 }} />
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                  Results
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--navy)",
                  letterSpacing: "-0.02em",
                }}
              >
                {generatedPosts.length} posts ready
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const headers = ["Post #", "Platform", "Framework", "Content", "CTA", "Image Suggestion"];
                const rows = generatedPosts.map((post, i) => [
                  String(i + 1),
                  post.platform.replace(/_/g, " "),
                  post.frameworkUsed,
                  post.content,
                  post.ctaUsed,
                  post.imageSuggestion,
                ]);
                const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
                const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "generated-posts.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                border: "1.5px solid var(--border)",
                background: "var(--card)",
                color: "var(--navy)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>↓</span> Download CSV
            </button>

            {/* Share page buttons */}
            {batchId && (
              <>
                <a
                  href={`/share/${batchId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: "1.5px solid var(--accent)",
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-syne)",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  ↗ Open as full page
                </a>
                <CopyLinkButton batchId={batchId} />
              </>
            )}
          </div>

          {/* Post cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {generatedPosts.map((post, i) => {
              const platformColor = PLATFORM_COLORS[post.platform] ?? "var(--accent)";
              return (
                <div
                  key={i}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "1.25rem",
                    boxShadow: "0 4px 24px rgba(16,23,44,0.06)",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "4px 1fr",
                  }}
                >
                  {/* Color stripe */}
                  <div style={{ background: platformColor }} />

                  <div style={{ padding: "1.25rem 1.5rem" }}>
                    {/* Card header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.875rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            background: platformColor,
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "capitalize",
                          }}
                        >
                          {post.platform.replace(/_/g, " ")}
                        </span>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            border: "1px solid var(--border)",
                            color: "var(--muted-fg)",
                            fontSize: "0.7rem",
                            fontWeight: 500,
                          }}
                        >
                          {post.frameworkUsed}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            color: "var(--muted-fg)",
                            fontWeight: 500,
                          }}
                        >
                          #{i + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard.writeText(post.content)}
                        style={{
                          padding: "0.375rem 0.875rem",
                          borderRadius: "0.5rem",
                          border: "1.5px solid var(--border)",
                          background: "transparent",
                          color: "var(--navy)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}
                      >
                        <span style={{ fontSize: "0.8rem" }}>⎘</span> Copy
                      </button>
                    </div>

                    {/* Post content */}
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        fontSize: "0.9rem",
                        lineHeight: 1.7,
                        color: "var(--navy)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {post.content}
                    </p>

                    {/* Image suggestion */}
                    {post.imageSuggestion && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "0.625rem 0.875rem",
                          borderRadius: "0.625rem",
                          background: "var(--muted)",
                          fontSize: "0.75rem",
                          color: "var(--muted-fg)",
                          fontStyle: "italic",
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <span style={{ flexShrink: 0 }}>📷</span>
                        <span>{post.imageSuggestion}</span>
                      </div>
                    )}

                    {/* Validation errors */}
                    {!post.validationReport.isValid && post.validationReport.errors.length > 0 && (
                      <ul style={{ marginTop: "0.5rem", paddingLeft: 0, listStyle: "none" }}>
                        {post.validationReport.errors.map((e, j) => (
                          <li key={j} style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.2rem" }}>
                            ⚠ {e}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
