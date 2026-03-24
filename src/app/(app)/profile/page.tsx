import { BusinessProfileForm } from "@/components/profile/business-profile-form";
import { OwnerWorkersPanel } from "@/components/profile/owner-workers-panel";
import { ownerCanUsePaidFeatures } from "@/lib/auth/subscription-access";
import { requireUser } from "@/lib/auth/session";
import { getProfileWithLibraries } from "@/services/repositories/profiles.repository";
import { ToastFeedback } from "@/components/layout/toast-feedback";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: { saved?: string | string[]; error?: string | string[] };
}) {
  const user = await requireUser();
  const { profile, eventTypes, serviceCategories } = await getProfileWithLibraries(user.id);

  const saved = searchParams?.saved;
  const error = searchParams?.error;
  const savedValue = Array.isArray(saved) ? saved[0] : saved;
  const errorValue = Array.isArray(error) ? error[0] : error;

  let toast: { variant: "success" | "error"; message: string } | undefined;

  if (savedValue === "1") {
    toast = { variant: "success", message: "Profile saved successfully." };
  }
  const showTeamSection =
    profile &&
    profile.account_role !== "worker" &&
    ownerCanUsePaidFeatures(profile);

  if (errorValue) {
    const message =
      errorValue === "invalid_profile"
        ? "Please check your profile details and try again."
        : errorValue === "save_failed"
          ? "Something went wrong while saving. Please try again."
          : errorValue === "invalid_selection"
            ? "Please select at least one event type and one service category."
            : "Something went wrong. Please try again.";
    toast = { variant: "error", message };
  }

  return (
    <div>
      {/* Page header */}
      <div className="animate-fade-up mb-8">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 32, height: 3, background: "var(--accent)", borderRadius: 2 }} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
            Business Profile
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Your content identity
        </h1>
        <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", color: "var(--muted-fg)" }}>
          This is what shapes every post we write for you.
        </p>
      </div>

      {toast && (
        <div style={{ marginBottom: "1.5rem" }}>
          <ToastFeedback message={toast.message} variant={toast.variant} />
        </div>
      )}

      <BusinessProfileForm
        initialProfile={profile}
        eventTypes={eventTypes}
        serviceCategories={serviceCategories}
      />

      {showTeamSection && <OwnerWorkersPanel />}
    </div>
  );
}
