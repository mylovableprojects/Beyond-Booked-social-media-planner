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

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { error } = await admin
    .from("profiles")
    .update({ trial_runs_used: 0 })
    .eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
