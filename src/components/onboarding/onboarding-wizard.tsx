"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  DEFAULT_EVENT_TYPES,
  DEFAULT_SERVICE_CATEGORIES,
} from "@/lib/constants/default-libraries";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validation/onboarding.schema";

type Step = 1 | 2 | 3 | 4;

const STEPS: { step: Step; label: string; sublabel: string }[] = [
  { step: 1, label: "Business info",      sublabel: "Your identity" },
  { step: 2, label: "Event types",        sublabel: "Who you serve" },
  { step: 3, label: "Service categories", sublabel: "What you offer" },
  { step: 4, label: "Review & save",      sublabel: "Almost there" },
];

function StepNav({ current, step, label }: { current: Step; step: Step; label: string }) {
  const active = current === step;
  const completed = current > step;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.65rem",
          fontWeight: 800,
          fontFamily: "var(--font-syne)",
          flexShrink: 0,
          transition: "all 0.2s ease",
          ...(completed
            ? { background: "var(--accent)", color: "#fff", border: "none" }
            : active
              ? { background: "var(--navy)", color: "#fff", border: "none" }
              : { background: "transparent", color: "var(--muted-fg)", border: "1.5px solid var(--border)" }),
        }}
      >
        {completed ? "✓" : String(step)}
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: active ? 700 : 500,
          color: active ? "var(--navy)" : completed ? "var(--accent)" : "var(--muted-fg)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.75rem",
  border: "1px solid var(--border)",
  background: "var(--muted)",
  color: "var(--navy)",
  padding: "0.65rem 0.875rem",
  fontSize: "0.875rem",
  fontFamily: "var(--font-dm-sans)",
  outline: "none",
  boxSizing: "border-box",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--muted-fg)",
  display: "block",
  marginBottom: "0.4rem",
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [customEventType, setCustomEventType] = useState("");
  const [customServiceCategory, setCustomServiceCategory] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: "",
      city: "",
      aboutStory: "",
      selectedEventTypes: [],
      selectedServiceCategories: [],
    },
  });

  const selectedEventTypes = form.watch("selectedEventTypes");
  const selectedServiceCategories = form.watch("selectedServiceCategories");
  const businessName = form.watch("businessName");
  const city = form.watch("city");

  const eventChipPool = useMemo(
    () => Array.from(new Set([...DEFAULT_EVENT_TYPES, ...selectedEventTypes])),
    [selectedEventTypes],
  );
  const serviceChipPool = useMemo(
    () => Array.from(new Set([...DEFAULT_SERVICE_CATEGORIES, ...selectedServiceCategories])),
    [selectedServiceCategories],
  );

  const toggleSelected = (field: "selectedEventTypes" | "selectedServiceCategories", value: string) => {
    const current = form.getValues(field);
    const exists = current.some((item) => item.toLowerCase() === value.toLowerCase());
    form.setValue(
      field,
      exists ? current.filter((item) => item.toLowerCase() !== value.toLowerCase()) : [...current, value],
      { shouldValidate: true },
    );
  };

  const addCustomItem = (
    field: "selectedEventTypes" | "selectedServiceCategories",
    value: string,
    clear: () => void,
  ) => {
    const item = value.trim();
    if (!item) return;
    const current = form.getValues(field);
    if (!current.some((entry) => entry.toLowerCase() === item.toLowerCase())) {
      form.setValue(field, [...current, item], { shouldValidate: true });
    }
    clear();
  };

  const goNext = async () => {
    if (step === 1) {
      const ok = await form.trigger(["businessName", "city", "aboutStory"]);
      if (!ok) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await form.trigger("selectedEventTypes");
      if (!ok) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      const ok = await form.trigger("selectedServiceCategories");
      if (!ok) return;
      setStep(4);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError("");
    setSaving(true);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Failed to save onboarding.");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save onboarding.");
    } finally {
      setSaving(false);
    }
  });

  const stepConfig = STEPS.find((s) => s.step === step)!;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Step nav */}
      <div
        className="animate-fade-up"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "2.5rem",
        }}
      >
        {STEPS.map((s, idx) => (
          <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <StepNav current={step} step={s.step} label={s.label} />
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: step > s.step ? "var(--accent)" : "var(--border)",
                  transition: "background 0.3s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div
        className="animate-fade-up animate-fade-up-1"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 40px rgba(16,23,44,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div
          style={{
            background: "var(--navy)",
            padding: "1.5rem 2rem",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "0.25rem",
              }}
            >
              Step {step} of 4
            </p>
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              {stepConfig.label}
            </h2>
          </div>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", paddingTop: "0.25rem" }}>
            {stepConfig.sublabel}
          </span>
        </div>

        <form onSubmit={onSubmit} style={{ padding: "2rem" }}>
          {/* ── Step 1: Business info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label style={{ display: "block" }}>
                  <span style={fieldLabelStyle}>Business name</span>
                  <input
                    {...form.register("businessName")}
                    style={inputStyle}
                    placeholder="Windy City Jump Rentals"
                  />
                  {form.formState.errors.businessName && (
                    <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.35rem" }}>
                      {form.formState.errors.businessName.message}
                    </p>
                  )}
                </label>

                <label style={{ display: "block" }}>
                  <span style={fieldLabelStyle}>City / market</span>
                  <input
                    {...form.register("city")}
                    style={inputStyle}
                    placeholder="Chicago"
                  />
                  {form.formState.errors.city && (
                    <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "0.35rem" }}>
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </label>
              </div>

              <label style={{ display: "block" }}>
                <span style={fieldLabelStyle}>About / brand story (optional)</span>
                <textarea
                  {...form.register("aboutStory")}
                  style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.6 }}
                  placeholder="Tell your story — what makes your rentals memorable and why families keep coming back."
                />
              </label>
            </div>
          )}

          {/* ── Step 2: Event types ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--muted-fg)", lineHeight: 1.6 }}>
                Select every event type you serve. These shape the content angle and tone of your posts.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {eventChipPool.map((item) => {
                  const active = selectedEventTypes.some(
                    (selected) => selected.toLowerCase() === item.toLowerCase(),
                  );
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSelected("selectedEventTypes", item)}
                      style={{
                        padding: "0.4rem 0.875rem",
                        borderRadius: "9999px",
                        border: `1.5px solid ${active ? "var(--navy)" : "var(--border)"}`,
                        background: active ? "var(--navy)" : "var(--muted)",
                        color: active ? "#fff" : "var(--muted-fg)",
                        fontSize: "0.78rem",
                        fontWeight: active ? 600 : 500,
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomItem("selectedEventTypes", customEventType, () => setCustomEventType(""));
                    }
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Add a custom event type"
                />
                <button
                  type="button"
                  onClick={() =>
                    addCustomItem("selectedEventTypes", customEventType, () => setCustomEventType(""))
                  }
                  disabled={!customEventType.trim()}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: "1.5px solid var(--navy)",
                    background: "transparent",
                    color: "var(--navy)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: customEventType.trim() ? "pointer" : "not-allowed",
                    opacity: customEventType.trim() ? 1 : 0.4,
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add
                </button>
              </div>

              {form.formState.errors.selectedEventTypes && (
                <p style={{ fontSize: "0.72rem", color: "#dc2626" }}>
                  {form.formState.errors.selectedEventTypes.message}
                </p>
              )}

              {selectedEventTypes.length > 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)" }}>
                  <span style={{ color: "var(--navy)", fontWeight: 700 }}>{selectedEventTypes.length}</span> event type{selectedEventTypes.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* ── Step 3: Service categories ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--muted-fg)", lineHeight: 1.6 }}>
                Select everything you offer. The more categories selected, the more varied your posts.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {serviceChipPool.map((item) => {
                  const active = selectedServiceCategories.some(
                    (selected) => selected.toLowerCase() === item.toLowerCase(),
                  );
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSelected("selectedServiceCategories", item)}
                      style={{
                        padding: "0.4rem 0.875rem",
                        borderRadius: "9999px",
                        border: `1.5px solid ${active ? "var(--gold)" : "var(--border)"}`,
                        background: active ? "rgba(221,171,44,0.12)" : "var(--muted)",
                        color: active ? "#8a6200" : "var(--muted-fg)",
                        fontSize: "0.78rem",
                        fontWeight: active ? 600 : 500,
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  value={customServiceCategory}
                  onChange={(e) => setCustomServiceCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomItem("selectedServiceCategories", customServiceCategory, () => setCustomServiceCategory(""));
                    }
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Add a custom service category"
                />
                <button
                  type="button"
                  onClick={() =>
                    addCustomItem("selectedServiceCategories", customServiceCategory, () =>
                      setCustomServiceCategory(""),
                    )
                  }
                  disabled={!customServiceCategory.trim()}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: "1.5px solid var(--gold)",
                    background: "transparent",
                    color: "#8a6200",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: customServiceCategory.trim() ? "pointer" : "not-allowed",
                    opacity: customServiceCategory.trim() ? 1 : 0.4,
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add
                </button>
              </div>

              {form.formState.errors.selectedServiceCategories && (
                <p style={{ fontSize: "0.72rem", color: "#dc2626" }}>
                  {form.formState.errors.selectedServiceCategories.message}
                </p>
              )}

              {selectedServiceCategories.length > 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)" }}>
                  <span style={{ color: "var(--navy)", fontWeight: 700 }}>{selectedServiceCategories.length}</span> categor{selectedServiceCategories.length !== 1 ? "ies" : "y"} selected
                </p>
              )}
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--muted-fg)", lineHeight: 1.6 }}>
                Looks great. Review your setup before we save your content identity.
              </p>

              {/* Review grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Business */}
                <div
                  style={{
                    background: "var(--navy)",
                    borderRadius: "1rem",
                    padding: "1.25rem",
                  }}
                >
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>
                    Business
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {businessName || "Not set"}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
                    {city || "No city"}
                  </p>
                </div>

                {/* Counts */}
                <div
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: "1rem",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: "0.25rem" }}>
                      Event types
                    </p>
                    <p style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
                      {selectedEventTypes.length}
                    </p>
                  </div>
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: "0.25rem" }}>
                      Service categories
                    </p>
                    <p style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>
                      {selectedServiceCategories.length}
                    </p>
                  </div>
                </div>
              </div>

              {submitError && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background: "rgba(220,38,38,0.05)",
                    border: "1px solid rgba(220,38,38,0.2)",
                    fontSize: "0.8rem",
                    color: "#dc2626",
                  }}
                >
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* Footer nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "2rem",
              marginTop: "2rem",
              borderTop: "1px solid var(--border)",
              gap: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))}
              disabled={step === 1 || saving}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                border: "1.5px solid var(--border)",
                background: "transparent",
                color: "var(--muted-fg)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: step === 1 || saving ? "not-allowed" : "pointer",
                opacity: step === 1 ? 0.4 : 1,
              }}
            >
              ← Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => void goNext()}
                style={{
                  padding: "0.75rem 2rem",
                  borderRadius: "0.875rem",
                  border: "none",
                  background: "var(--navy)",
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-syne)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                Continue <span style={{ opacity: 0.7 }}>→</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "0.75rem 2rem",
                  borderRadius: "0.875rem",
                  border: "none",
                  background: saving ? "var(--border)" : "var(--accent)",
                  color: saving ? "var(--muted-fg)" : "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-syne)",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.15s ease",
                }}
              >
                {saving ? "Saving…" : <>Launch my toolkit <span style={{ opacity: 0.7 }}>→</span></>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
