import { NextResponse } from "next/server";

import { toStandaloneHtml } from "@/domain/export/html-export";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

import type { GeneratedPost } from "@/types/content";
import type { Platform } from "@/types/platform";

const exportRequestSchema = z.object({
  batchId: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedBody = exportRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request body.", details: parsedBody.error.flatten() },
      { status: 400 },
    );
  }

  const { batchId } = parsedBody.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: batch,
    error: batchError,
  } = await supabase
    .from("generation_runs")
    .select("id, profile_id, month, year, featured_product, created_at")
    .eq("id", batchId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (batchError) return NextResponse.json({ error: "Failed to load batch." }, { status: 500 });
  if (!batch) return NextResponse.json({ error: "Batch not found." }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, city")
    .eq("id", user.id)
    .maybeSingle();

  const { data: selections } = await supabase
    .from("generation_selections")
    .select("event_types, service_categories")
    .eq("generation_run_id", batchId)
    .maybeSingle();

  const { data: rows, error: postsError } = await supabase
    .from("generated_posts")
    .select("platform, framework_used, post_index, content, image_suggestion")
    .eq("generation_run_id", batchId)
    .order("platform", { ascending: true })
    .order("post_index", { ascending: true });

  if (postsError) return NextResponse.json({ error: "Failed to load posts." }, { status: 500 });

  type GeneratedPostRow = {
    platform: Platform;
    framework_used: GeneratedPost["frameworkUsed"];
    post_index: GeneratedPost["postIndex"];
    content: GeneratedPost["content"];
    image_suggestion: GeneratedPost["imageSuggestion"];
  };

  type HtmlExportPost = {
    platform: Platform;
    frameworkUsed: GeneratedPost["frameworkUsed"];
    postIndex: GeneratedPost["postIndex"];
    content: GeneratedPost["content"];
    imageSuggestion: GeneratedPost["imageSuggestion"];
  };

  const posts: HtmlExportPost[] = (rows ?? []).map((row: GeneratedPostRow) => ({
    platform: row.platform,
    frameworkUsed: row.framework_used,
    postIndex: row.post_index,
    content: row.content,
    imageSuggestion: row.image_suggestion,
  }));

  const html = toStandaloneHtml({
    businessName: profile?.business_name ?? "Business",
    city: profile?.city ?? "",
    generationDate: batch.created_at,
    month: batch.month,
    year: batch.year,
    selectedEventTypes: selections?.event_types ?? [],
    selectedServiceCategories: selections?.service_categories ?? [],
    featuredProduct: batch.featured_product ?? null,
    posts,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="social-content-export-${batchId}.html"`,
    },
  });
}
