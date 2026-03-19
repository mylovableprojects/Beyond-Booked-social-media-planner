import Link from "next/link";

export default function HistoryPage() {
  return (
    <div>
      {/* Page header */}
      <div className="animate-fade-up mb-10">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 32, height: 3, background: "var(--gold)", borderRadius: 2 }} />
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted-fg)",
            }}
          >
            Generation History
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 800,
            color: "var(--navy)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Your content archive
        </h1>
        <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", color: "var(--muted-fg)" }}>
          Every run you've generated — copy, export, or revisit anytime.
        </p>
      </div>

      {/* Empty state card */}
      <div
        className="animate-fade-up animate-fade-up-1"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 40px rgba(16,23,44,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, var(--navy) 0%, var(--accent) 50%, var(--gold) 100%)" }} />

        <div
          style={{
            padding: "4rem 3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.5rem",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "1.25rem",
              background: "var(--navy)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 40px rgba(16,23,44,0.18)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12h6M9 16h4"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Headline */}
          <div>
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--navy)",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}
            >
              No runs yet
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--muted-fg)", lineHeight: 1.6, maxWidth: 380 }}>
              Once you generate content, every batch will appear here for quick re-copy or CSV export.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/generator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: "0.875rem",
              padding: "0.75rem 1.75rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "var(--font-syne)",
              letterSpacing: "0.01em",
              textDecoration: "none",
            }}
          >
            Generate your first batch
            <span style={{ opacity: 0.7 }}>→</span>
          </Link>

          {/* Stat chips */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "0.5rem",
            }}
          >
            {["Facebook", "Instagram", "Google Business"].map((platform) => (
              <span
                key={platform}
                style={{
                  padding: "0.35rem 0.875rem",
                  borderRadius: "9999px",
                  border: "1px solid var(--border)",
                  background: "var(--muted)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--muted-fg)",
                }}
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
