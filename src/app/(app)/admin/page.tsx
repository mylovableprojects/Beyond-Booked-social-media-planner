import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminFieldCaptureUrlCard } from "@/components/admin/admin-field-capture-url-card";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

async function requestSiteOrigin(): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const rawProto = h.get("x-forwarded-proto");
  const proto =
    rawProto?.split(",")[0]?.trim() ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function AdminPage() {
  const user = await requireUser();

  // Verify requester is admin
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin, is_support_admin")
    .eq("id", user.id)
    .maybeSingle<Pick<ProfileRow, "is_admin" | "is_support_admin">>();

  if (!profile?.is_admin && !profile?.is_support_admin) redirect("/dashboard");

  // Fetch all profiles
  const { data: profiles } = await admin
    .from("profiles")
    .select(
      "id, first_name, last_name, business_name, city, state_region, trial_runs_used, is_admin, is_support_admin, account_role, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<ProfileRow[]>();

  // Fetch auth emails (admin API)
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  for (const u of authData?.users ?? []) {
    emailMap[u.id] = u.email ?? "";
  }

  const rows = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap[p.id] ?? "",
  }));

  const origin = await requestSiteOrigin();
  const fieldCaptureUrl = origin ? `${origin}/dashboard/field-upload` : "/dashboard/field-upload";

  return (
    <div>
      <div className="animate-fade-up mb-8">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 32, height: 3, background: "var(--accent)", borderRadius: 2 }} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)" }}>
            Admin
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          User management
        </h1>
        <p style={{ marginTop: "0.4rem", fontSize: "0.875rem", color: "var(--muted-fg)" }}>
          {rows.length} account{rows.length !== 1 ? "s" : ""} total
          {!profile.is_admin && profile.is_support_admin ? " — view only (no delete, impersonation, or promotions)" : ""}
        </p>
      </div>

      <AdminFieldCaptureUrlCard fullUrl={fieldCaptureUrl} />

      <AdminUsersTable users={rows} currentUserId={user.id} canFullAdmin={profile.is_admin} />
    </div>
  );
}
