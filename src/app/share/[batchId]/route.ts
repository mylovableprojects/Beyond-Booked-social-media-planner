import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { toStandaloneHtml } from "@/domain/export/html-export";
import type { GeneratedPost } from "@/types/content";
import type { Platform } from "@/types/platform";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await params;

  if (!batchId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: batch, error: batchError } = await supabase
    .from("generation_runs")
    .select("id, profile_id, month, year, featured_product, created_at")
    .eq("id", batchId)
    .maybeSingle();

  if (batchError || !batch) {
    return new NextResponse("Batch not found", { status: 404 });
  }

  const [profileResult, selectionsResult, postsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("business_name, city")
      .eq("id", batch.profile_id)
      .maybeSingle(),
    supabase
      .from("generation_selections")
      .select("event_types, service_categories")
      .eq("generation_run_id", batchId)
      .maybeSingle(),
    supabase
      .from("generated_posts")
      .select("platform, framework_used, post_index, content, image_suggestion")
      .eq("generation_run_id", batchId)
      .order("platform", { ascending: true })
      .order("post_index", { ascending: true }),
  ]);

  if (postsResult.error) {
    return new NextResponse("Failed to load posts", { status: 500 });
  }

  type Row = {
    platform: Platform;
    framework_used: GeneratedPost["frameworkUsed"];
    post_index: GeneratedPost["postIndex"];
    content: GeneratedPost["content"];
    image_suggestion: GeneratedPost["imageSuggestion"];
  };

  const posts = (postsResult.data ?? []).map((row: Row) => ({
    platform: row.platform,
    frameworkUsed: row.framework_used,
    postIndex: row.post_index,
    content: row.content,
    imageSuggestion: row.image_suggestion,
  }));

  const html = toStandaloneHtml({
    businessName: profileResult.data?.business_name ?? "Business",
    city: profileResult.data?.city ?? "",
    generationDate: batch.created_at,
    month: batch.month,
    year: batch.year,
    selectedEventTypes: selectionsResult.data?.event_types ?? [],
    selectedServiceCategories: selectionsResult.data?.service_categories ?? [],
    featuredProduct: batch.featured_product ?? null,
    posts,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Allow browsers to cache for up to 1 hour; the data won't change
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
