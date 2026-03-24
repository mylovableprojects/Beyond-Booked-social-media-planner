import { NextRequest, NextResponse } from "next/server";

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

  const admin = createSupabaseAdminClient();
  const { data: me } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle<Pick<ProfileRow, "is_admin">>();
  if (!me?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = typeof body === "object" && body !== null && "userId" in body ? String((body as { userId: unknown }).userId) : "";
  const isSupport =
    typeof body === "object" && body !== null && "isSupportAdmin" in body
      ? Boolean((body as { isSupportAdmin: unknown }).isSupportAdmin)
      : false;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "Cannot change your own support flag here" }, { status: 400 });
  }

  const { data: target } = await admin
    .from("profiles")
    .select("account_role")
    .eq("id", userId)
    .maybeSingle<Pick<ProfileRow, "account_role">>();

  if (!target || target.account_role !== "owner") {
    return NextResponse.json({ error: "Support access applies to business accounts only" }, { status: 400 });
  }

  const { error } = await admin.from("profiles").update({ is_support_admin: isSupport }).eq("id", userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
