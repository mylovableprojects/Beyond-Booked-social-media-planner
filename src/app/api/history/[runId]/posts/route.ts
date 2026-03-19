import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { runId } = await params;
  const admin = createSupabaseAdminClient();

  // Verify this run belongs to the requesting user
  const { data: run } = await admin
    .from("generation_runs")
    .select("profile_id")
    .eq("id", runId)
    .maybeSingle();

  if (!run || run.profile_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: posts } = await admin
    .from("generated_posts")
    .select("platform, framework_used, cta_used, post_index, content, image_suggestion")
    .eq("generation_run_id", runId)
    .order("post_index", { ascending: true });

  return NextResponse.json(posts ?? []);
}
