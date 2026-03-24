import type { ProfileRow } from "@/types/db";

type RoleFields = { account_role?: ProfileRow["account_role"] | null };

/** Field-only logins created under a business owner. */
export function isWorkerAccount(profile: RoleFields | null | undefined): boolean {
  return profile?.account_role === "worker";
}

/**
 * Who may list/add/remove worker invites on Profile.
 * Business owners (and legacy rows with no account_role yet) may; field workers may not.
 */
export function canManageWorkerInvites(profile: RoleFields | null | undefined): boolean {
  return profile != null && !isWorkerAccount(profile);
}
