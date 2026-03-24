import type { ProfileRow } from "@/types/db";

/** Business owners can use paid features, including inviting field workers (trial = first run not used yet). */
export function ownerCanUsePaidFeatures(
  p: Pick<ProfileRow, "is_admin" | "subscription_status" | "trial_runs_used">,
): boolean {
  return p.is_admin || p.subscription_status === "active" || (p.trial_runs_used ?? 0) < 1;
}
