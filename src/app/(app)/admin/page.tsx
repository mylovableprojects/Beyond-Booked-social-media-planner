import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminAddWorkerPanel } from "@/components/admin/admin-add-worker-panel";
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

const EXTENDED_PROFILE_SELECT =
  "id, first_name, last_name, business_name, city, state_region, trial_runs_used, is_admin, is_support_admin, account_role, created_at";

const LEGACY_PROFILE_SELECT =
  "id, first_name, last_name, business_name, city, state_region, trial_runs_used, is_admin, created_at";

export default async function AdminPage() {
  const user = await requireUser();

  const admin = createSupabaseAdminClient();
  const { data: gateProfile } = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle<ProfileRow>();

  if (!gateProfile?.is_admin && !gateProfile?.is_support_admin) redirect("/dashboard");

  const employerColumnProbe = await admin.from("profiles").select("employer_profile_id").limit(1);
  const workerSchemaOk = !employerColumnProbe.error;

  const extendedRes = await admin.from("profiles").select(EXTENDED_PROFILE_SELECT).order("created_at", { ascending: false });

  type Row = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string;
    city: string;
    state_region: string | null;
    trial_runs_used: number;
    is_admin: boolean;
    is_support_admin: boolean;
    account_role: "owner" | "worker";
    created_at: string;
  };

  let rawRows: Row[] = [];

  if (extendedRes.error) {
    const legacyRes = await admin.from("profiles").select(LEGACY_PROFILE_SELECT).order("created_at", { ascending: false });
    if (!legacyRes.error) {
      const legacy = legacyRes.data ?? [];
      rawRows = legacy.map((p) => ({
        ...p,
        is_support_admin: false,
        account_role: "owner" as const,
      }));
    }
  } else {
    rawRows = (extendedRes.data ?? []).map((p) => ({
      ...(p as Row),
      is_support_admin: Boolean((p as { is_support_admin?: boolean }).is_support_admin),
      account_role: ((p as { account_role?: string }).account_role as "owner" | "worker") ?? "owner",
    }));
  }

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  for (const u of authData?.users ?? []) {
    emailMap[u.id] = u.email ?? "";
  }

  const rows = rawRows.map((p) => ({
    ...p,
    email: emailMap[p.id] ?? "",
  }));

  const employerOptions = rows
    .filter((p) => (p.account_role ?? "owner") !== "worker")
    .map((p) => ({
      id: p.id,
      label: `${p.business_name || "Business"} — ${p.email || p.id.slice(0, 8)}…`,
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
          {!gateProfile.is_admin && gateProfile.is_support_admin ? " — view only (no delete, impersonation, or promotions)" : ""}
        </p>
      </div>

      <AdminFieldCaptureUrlCard fullUrl={fieldCaptureUrl} />

      {gateProfile.is_admin && (
        <AdminAddWorkerPanel employers={employerOptions} workerSchemaReady={workerSchemaOk} />
      )}

      <AdminUsersTable users={rows} currentUserId={user.id} canFullAdmin={gateProfile.is_admin} />
    </div>
  );
}
