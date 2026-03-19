import { PLATFORM_RULE_SUMMARIES } from "@/lib/constants/platforms";

export function PlatformRulesHint() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--navy)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 20px rgba(16,23,44,0.12)",
      }}
    >
      <h3
        className="text-sm font-bold text-white"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        Platform Rules
      </h3>
      <ul className="mt-4 space-y-4">
        {Object.entries(PLATFORM_RULE_SUMMARIES).map(([platform, rules]) => (
          <li key={platform}>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--gold)" }}
            >
              {platform.replaceAll("_", " ")}
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {rules}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
