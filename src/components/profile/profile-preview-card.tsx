type ProfilePreviewCardProps = {
  businessName: string;
  city: string;
  stateRegion?: string;
  aboutStory?: string | null;
};

export function ProfilePreviewCard({
  businessName,
  city,
  stateRegion,
  aboutStory,
}: ProfilePreviewCardProps) {
  const aboutSnippet = aboutStory ? aboutStory.trim() : "";
  const shownAbout = aboutSnippet.length > 200 ? `${aboutSnippet.slice(0, 200)}…` : aboutSnippet;
  const initials = businessName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      style={{
        background: "var(--navy)",
        borderRadius: "1.25rem",
        padding: "1.5rem",
        boxShadow: "0 8px 32px rgba(16,23,44,0.14)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,88,51,0.06)",
          pointerEvents: "none",
        }}
      />

      <p
        style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: "1rem",
        }}
      >
        Content Identity Preview
      </p>

      {/* Business avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "0.75rem",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-syne)",
            fontSize: "0.9rem",
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials || "PR"}
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#fff",
              lineHeight: 1.2,
            }}
          >
            {businessName || "Your Business Name"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "0.15rem" }}>
            {city || "Your City"}{stateRegion ? `, ${stateRegion}` : ""}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "1rem" }} />

      {/* About */}
      {shownAbout ? (
        <p
          style={{
            fontSize: "0.8rem",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.55)",
            fontStyle: "italic",
          }}
        >
          "{shownAbout}"
        </p>
      ) : (
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
          Add your story above to see it here…
        </p>
      )}
    </div>
  );
}
