import { NextRequest, NextResponse } from "next/server";

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

  const { data: me } = await supabase
    .from("profiles")
    .select("account_role, is_admin, subscription_status, trial_runs_used")
    .eq("id", user.id)
    .maybeSingle<
      Pick<ProfileRow, "account_role" | "is_admin" | "subscription_status" | "trial_runs_used">
    >();

  if (!me || me.account_role !== "owner") {
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
  const { data: target } = await admin
    .from("profiles")
    .select("id, account_role, employer_profile_id")
    .eq("id", workerId)
    .maybeSingle<Pick<ProfileRow, "id" | "account_role" | "employer_profile_id">>();

  if (!target || target.account_role !== "worker" || target.employer_profile_id !== user.id) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  const { error } = await admin.auth.admin.deleteUser(workerId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
