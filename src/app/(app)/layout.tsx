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
  // Select * so a partial migration (missing new columns) does not fail the whole row fetch.
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle<ProfileRow>();

  return (
    <AppShell
      isAdmin={Boolean(profile?.is_admin)}
      isSupportAdmin={Boolean(profile?.is_support_admin)}
      isWorker={profile?.account_role === "worker"}
    >
      {children}
    </AppShell>
  );
}
