import { NextResponse } from "next/server";

import { canManageWorkerInvites } from "@/lib/auth/account-roles";
import { ownerCanUsePaidFeatures } from "@/lib/auth/subscription-access";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

/** List crew logins for this business owner. Adding workers is done in Admin → Add field worker. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<ProfileRow>();

  if (me == null || !canManageWorkerInvites(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!ownerCanUsePaidFeatures(me)) {
    return NextResponse.json({ error: "Subscription or active trial required to manage workers." }, { status: 402 });
  }

  const admin = createSupabaseAdminClient();
  const { data: workers, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, created_at")
    .eq("employer_profile_id", user.id)
    .eq("account_role", "worker")
    .order("created_at", { ascending: false });

  if (error) {
    let msg = error.message;
    if (msg.includes("employer_profile_id") || msg.includes("account_role")) {
      msg +=
        " Apply the migration `supabase/migrations/202603260001_account_roles_workers_support.sql` in Supabase → SQL Editor (or `supabase db push` from this repo).";
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const rows = workers ?? [];
  const emails: Record<string, string> = {};
  await Promise.all(
    rows.map(async (w) => {
      const { data: authUser } = await admin.auth.admin.getUserById(w.id);
      emails[w.id] = authUser.user?.email ?? "";
    }),
  );

  return NextResponse.json({
    workers: rows.map((w) => ({
      id: w.id,
      first_name: w.first_name,
      last_name: w.last_name,
      created_at: w.created_at,
      email: emails[w.id] ?? "",
    })),
  });
}
