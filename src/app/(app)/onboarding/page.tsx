import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  await requireUser();

  return (
    <div>
      {/* Page header */}
      <div className="animate-fade-up mb-10">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 32, height: 3, background: "var(--accent)", borderRadius: 2 }} />
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted-fg)",
            }}
          >
            Welcome
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
          Set up your toolkit
        </h1>
        <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", color: "var(--muted-fg)" }}>
          Build your business profile once — then generate platform-ready posts in minutes.
        </p>
      </div>

      <OnboardingWizard />
    </div>
  );
}
