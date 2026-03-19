import { redirect } from "next/navigation";

import { GeneratorForm } from "@/components/generator/generator-form";
import { requireUser } from "@/lib/auth/session";
import { getProfileWithLibraries } from "@/services/repositories/profiles.repository";

export default async function GeneratorPage() {
  const user = await requireUser();
  const { profile, eventTypes, serviceCategories } = await getProfileWithLibraries(user.id);

  // Must have a complete profile before generating
  if (!profile || !profile.city || profile.city.trim() === "" || eventTypes.length === 0 || serviceCategories.length === 0) {
    redirect("/onboarding");
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
      />
    </div>
  );
}
