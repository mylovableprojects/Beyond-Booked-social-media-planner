export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        borderRadius: "1.25rem",
        border: "1px dashed var(--border)",
        background: "var(--muted)",
        padding: "2.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <div
          style={{
            marginTop: 2,
            width: 36,
            height: 36,
            borderRadius: "0.75rem",
            background: "var(--navy)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-2.8L12 2z"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h3
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--navy)",
              marginBottom: "0.35rem",
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted-fg)" }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
