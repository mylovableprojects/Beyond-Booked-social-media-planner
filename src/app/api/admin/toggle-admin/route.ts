import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle<Pick<ProfileRow, "is_admin">>();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, isAdmin } = await request.json();
  if (!userId || userId === user.id) {
    return NextResponse.json({ error: "Cannot change your own admin status" }, { status: 400 });
  }

  const { data: target } = await admin
    .from("profiles")
    .select("account_role")
    .eq("id", userId)
    .maybeSingle<Pick<ProfileRow, "account_role">>();
  if (target?.account_role === "worker") {
    return NextResponse.json({ error: "Field worker accounts cannot be platform admins" }, { status: 400 });
  }

  const { error } = await admin
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
