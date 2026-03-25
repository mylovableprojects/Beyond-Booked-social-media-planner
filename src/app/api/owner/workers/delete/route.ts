import { NextRequest, NextResponse } from "next/server";

import { canManageWorkerInvites } from "@/lib/auth/account-roles";
import { ownerCanUsePaidFeatures } from "@/lib/auth/subscription-access";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: "Subscription or active trial required." }, { status: 402 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const workerId =
    typeof body === "object" && body !== null && "userId" in body ? String((body as { userId: unknown }).userId) : "";
  if (!workerId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: target, error: targetErr } = await admin
    .from("profiles")
    .select("id, account_role, employer_profile_id")
    .eq("id", workerId)
    .maybeSingle<Pick<ProfileRow, "id" | "account_role" | "employer_profile_id">>();

  if (targetErr) {
    let msg = targetErr.message;
    if (msg.includes("employer_profile_id") || msg.includes("account_role")) {
      msg +=
        " Apply the migration `supabase/migrations/202603260001_account_roles_workers_support.sql` in Supabase → SQL Editor.";
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (!target || target.account_role !== "worker" || target.employer_profile_id !== user.id) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  const { error } = await admin.auth.admin.deleteUser(workerId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
