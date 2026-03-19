export function ToastFeedback({
  message,
  variant = "success",
}: {
  message: string;
  variant?: "success" | "error";
}) {
  const isError = variant === "error";
  return (
    <div
      style={{
        background: isError ? "rgba(220,38,38,0.06)" : "rgba(221,171,44,0.10)",
        border: `1.5px solid ${isError ? "rgba(220,38,38,0.25)" : "rgba(221,171,44,0.3)"}`,
        borderRadius: "1rem",
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontSize: "1.1rem", flexShrink: 0, lineHeight: 1.4 }}>
        {isError ? "⚠️" : "✓"}
      </span>
      <p style={{
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.6,
        color: isError ? "#b91c1c" : "#a07800",
        margin: 0,
      }}>
        {message}
      </p>
    </div>
  );
}
