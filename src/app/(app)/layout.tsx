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
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle<Pick<ProfileRow, "is_admin">>();

  return <AppShell isAdmin={profile?.is_admin ?? false}>{children}</AppShell>;
}
