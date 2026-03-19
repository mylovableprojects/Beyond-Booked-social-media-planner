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
  if (!userId || userId === user.id) {
    return NextResponse.json({ error: "Cannot impersonate yourself" }, { status: 400 });
  }

  // Get the user's email from auth
  const { data: targetUser, error: fetchError } = await admin.auth.admin.getUserById(userId);
  if (fetchError || !targetUser?.user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Generate a magic link for that user
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: targetUser.user.email,
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: linkError?.message ?? "Failed to generate link" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, link: linkData.properties.action_link, email: targetUser.user.email });
}
