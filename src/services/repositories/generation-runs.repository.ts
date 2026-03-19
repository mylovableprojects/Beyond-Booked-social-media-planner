import type { GeneratedPost } from "@/types/content";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listGenerationRuns(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("generation_runs")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertGeneratedPosts(runId: string, posts: GeneratedPost[]) {
  const supabase = await createSupabaseServerClient();
  const payload = posts.map((post) => ({
    generation_run_id: runId,
    platform: post.platform,
    framework_used: post.frameworkUsed,
    cta_used: post.ctaUsed,
    post_index: post.postIndex,
    content: post.content,
    image_suggestion: post.imageSuggestion,
    validation_report: post.validationReport,
  }));

  const { error } = await supabase.from("generated_posts").insert(payload);
  if (error) throw error;
}
