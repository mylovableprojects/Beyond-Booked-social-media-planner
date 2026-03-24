import Link from "next/link";
import { redirect } from "next/navigation";

import { GeneratorForm } from "@/components/generator/generator-form";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { requireUser } from "@/lib/auth/session";
import { getProfileWithLibraries } from "@/services/repositories/profiles.repository";

export default async function GeneratorPage() {
  const user = await requireUser();
  const { profile, eventTypes, serviceCategories } = await getProfileWithLibraries(user.id);

  // Must have a complete profile before generating
  if (!profile || !profile.city || profile.city.trim() === "" || eventTypes.length === 0 || serviceCategories.length === 0) {
    redirect("/onboarding");
  }

  const isPaid = profile.is_admin || profile.subscription_status === "active";

  // Trial used and not paid — show upgrade screen
  if (!isPaid && (profile.trial_runs_used ?? 0) >= 1) {
    return (
      <div>
        <div className="animate-fade-up mb-8">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{ width: 32, height: 3, background: "var(--accent)", borderRadius: 2 }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
              Content Studio
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Generate your posts
          </h1>
        </div>

        <div
          className="animate-fade-up"
          style={{
            background: "var(--navy)",
            border: "1.5px solid rgba(255,88,51,0.3)",
            borderRadius: "1.5rem",
            padding: "3rem 2.5rem",
            textAlign: "center",
            maxWidth: 560,
            margin: "0 auto",
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
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1.375rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
            }}
          >
            You&apos;ve used your free trial run.
          </h2>
          <p style={{ fontSize: "0.925rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 0.75rem" }}>
            Now you know what it can do. Upgrade to keep generating posts every month — 27 posts/month, all 4 frameworks, all 3 platforms.
          </p>
          <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gold)", marginBottom: "1.75rem", fontFamily: "var(--font-syne)" }}>
            $297 / year
          </p>
          <UpgradeButton />
          <p style={{ marginTop: "1.25rem" }}>
            <Link href="/dashboard" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Back to dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="animate-fade-up mb-8">
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
            Content Studio
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
          Generate your posts
        </h1>
        <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", color: "var(--muted-fg)" }}>
          Configure your content below — takes about 10 seconds to run.
        </p>
      </div>

      <GeneratorForm
        profileId={user.id}
        savedEventTypes={eventTypes}
        savedServiceCategories={serviceCategories}
        city={profile?.city ?? ""}
        stateRegion={profile?.state_region ?? null}
        isTrial={!isPaid && (profile.trial_runs_used ?? 0) === 0}
      />
    </div>
  );
}
