"use client";

import { useMemo, useState } from "react";

import { DEFAULT_EVENT_TYPES, DEFAULT_SERVICE_CATEGORIES } from "@/lib/constants/default-libraries";
import { EventTypeSelector } from "./event-type-selector";
import { ServiceCategorySelector } from "./service-category-selector";
import { ProfilePreviewCard } from "./profile-preview-card";

type BusinessProfileFormProps = {
  initialProfile: {
    business_name?: string;
    city?: string;
    state_region?: string | null;
    timezone?: string;
    brand_notes?: string | null;
  } | null;
  eventTypes: string[];
  serviceCategories: string[];
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase" as const,
        color: "var(--muted-fg)",
        display: "block",
        marginBottom: "0.4rem",
      }}
    >
      {children}
    </span>
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

export function BusinessProfileForm({
  initialProfile,
  eventTypes,
  serviceCategories,
}: BusinessProfileFormProps) {
  const effectiveEventTypes = useMemo(
    () => (eventTypes.length ? eventTypes : [...DEFAULT_EVENT_TYPES]),
    [eventTypes],
  );
  const effectiveServiceCategories = useMemo(
    () => (serviceCategories.length ? serviceCategories : [...DEFAULT_SERVICE_CATEGORIES]),
    [serviceCategories],
  );

  const [businessName, setBusinessName] = useState(initialProfile?.business_name ?? "");
  const [city, setCity] = useState(initialProfile?.city ?? "");
  const [brandNotes, setBrandNotes] = useState(initialProfile?.brand_notes ?? "");
  const [selectedEventTypes, setSelectedEventTypes] = useState(effectiveEventTypes);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState(effectiveServiceCategories);

  const stateRegionValue = initialProfile?.state_region ?? "";
  const timezoneValue = initialProfile?.timezone ?? "America/Chicago";

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .profile-grid { grid-template-columns: 1fr !important; }
        .profile-name-city { grid-template-columns: 1fr !important; }
        .profile-form-body { padding: 1.25rem !important; }
        .profile-card-header { padding: 1rem 1.25rem !important; }
      }
    `}</style>
    <div
      className="profile-grid animate-fade-up"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      {/* ── Main form card ── */}
      <div
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
          className="profile-card-header"
          style={{
            background: "var(--navy)",
            padding: "1.25rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            Business details
          </h2>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
            Used in every post we generate
          </span>
        </div>

        <form
          action="/api/profile"
          method="post"
          className="profile-form-body"
          style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}
        >
          {/* Hidden fields */}
          <input type="hidden" name="stateRegion" value={stateRegionValue} />
          <input type="hidden" name="timezone" value={timezoneValue} />
          <input type="hidden" name="selectedEventTypes" value={JSON.stringify(selectedEventTypes)} />
          <input type="hidden" name="selectedServiceCategories" value={JSON.stringify(selectedServiceCategories)} />

          {/* Business name + City row */}
          <div className="profile-name-city" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label style={{ display: "block" }}>
              <FieldLabel>Business name</FieldLabel>
              <input
                name="businessName"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                style={inputStyle}
                placeholder="Windy City Jump Rentals"
              />
            </label>
            <label style={{ display: "block" }}>
              <FieldLabel>City / market</FieldLabel>
              <input
                name="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
                placeholder="Chicago"
              />
            </label>
          </div>

          {/* Brand story */}
          <label style={{ display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <FieldLabel>About / brand story</FieldLabel>
              <span style={{ fontSize: "0.65rem", color: brandNotes.length > 1800 ? "#dc2626" : "var(--muted-fg)" }}>
                {brandNotes.length} / 2000
              </span>
            </div>
            <textarea
              name="brandNotes"
              value={brandNotes}
              onChange={(e) => setBrandNotes(e.target.value)}
              maxLength={2000}
              style={{
                ...inputStyle,
                minHeight: 100,
                resize: "vertical",
                lineHeight: 1.6,
              }}
              placeholder="Tell your story — what makes your rentals memorable and why families keep coming back."
            />
          </label>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Event types */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
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
                01
              </span>
              <div style={{ height: 1, width: 20, background: "var(--border)" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                Event types you serve
              </span>
            </div>
            <EventTypeSelector selected={selectedEventTypes} onChange={setSelectedEventTypes} />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Service categories */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  color: "var(--gold)",
                  letterSpacing: "0.08em",
                  minWidth: 20,
                }}
              >
                02
              </span>
              <div style={{ height: 1, width: 20, background: "var(--border)" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
                Services you offer
              </span>
            </div>
            <ServiceCategorySelector selected={selectedServiceCategories} onChange={setSelectedServiceCategories} />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Save button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)" }}>
              <span style={{ color: "var(--navy)", fontWeight: 600 }}>{selectedEventTypes.length}</span> event types ·{" "}
              <span style={{ color: "var(--navy)", fontWeight: 600 }}>{selectedServiceCategories.length}</span> service categories
            </p>
            <button
              type="submit"
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "0.875rem",
                padding: "0.75rem 2rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                fontFamily: "var(--font-syne)",
                letterSpacing: "0.01em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Save profile <span style={{ opacity: 0.7 }}>→</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "5rem" }}>
        <ProfilePreviewCard
          businessName={businessName}
          city={city}
          stateRegion={stateRegionValue || undefined}
          aboutStory={brandNotes}
        />

        {/* Tip card */}
        <div
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.25rem",
          }}
        >
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "0.5rem",
            }}
          >
            Pro tip
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-fg)", lineHeight: 1.6 }}>
            The more event types and service categories you select, the more varied and relevant your generated posts will be.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
