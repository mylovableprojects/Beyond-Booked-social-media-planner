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
      className="rounded-xl px-4 py-3 text-sm font-medium"
      style={{
        background: isError ? "rgba(220,38,38,0.08)" : "rgba(221,171,44,0.12)",
        border: `1px solid ${isError ? "rgba(220,38,38,0.2)" : "rgba(221,171,44,0.25)"}`,
        color: isError ? "#dc2626" : "#a07800",
      }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
