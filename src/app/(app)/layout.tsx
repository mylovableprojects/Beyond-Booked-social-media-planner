import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin, is_support_admin, account_role")
    .eq("id", user.id)
    .maybeSingle<Pick<ProfileRow, "is_admin" | "is_support_admin" | "account_role">>();

  return (
    <AppShell
      isAdmin={profile?.is_admin ?? false}
      isSupportAdmin={profile?.is_support_admin ?? false}
      isWorker={profile?.account_role === "worker"}
    >
      {children}
    </AppShell>
  );
}
