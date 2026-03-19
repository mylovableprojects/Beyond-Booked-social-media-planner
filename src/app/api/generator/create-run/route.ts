import { NextResponse } from "next/server";

export const maxDuration = 60;
import { generatorRequestSchema } from "@/lib/validation/generator.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generatePostsDraft } from "@/services/content-engine";
import type { ProfileRow } from "@/types/db";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generatorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid generation request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) {
    return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
  }

  // Trial gate — free accounts get one run
  if ((profile.trial_runs_used ?? 0) >= 1) {
    return NextResponse.json(
      { ok: false, error: "trial_limit" },
      { status: 402 },
    );
  }

  // Generate posts first
  const posts = await generatePostsDraft({
    profileId: user.id,
    city: profile.city,
    stateRegion: profile.state_region,
    month: parsed.data.month,
    year: parsed.data.year,
    postCount: parsed.data.postCount,
    platforms: parsed.data.platforms,
    eventTypes: parsed.data.eventTypes,
    serviceCategories: parsed.data.serviceCategories,
    promoText: parsed.data.promoText,
    featuredProduct: parsed.data.featuredProduct,
  });

  // Save the run to Supabase so /share/[batchId] can serve it
  const { data: run, error: runError } = await supabase
    .from("generation_runs")
    .insert({
      profile_id: user.id,
      month: parsed.data.month,
      year: parsed.data.year,
      post_count: posts.length,
      promo_text: parsed.data.promoText ?? null,
      featured_product: parsed.data.featuredProduct ?? null,
      status: "completed",
    })
    .select("id")
    .single();

  if (runError || !run) {
    // Still return posts even if save fails — don't block the user
    return NextResponse.json({ ok: true, posts, batchId: null });
  }

  const batchId: string = run.id;

  // Save selections and posts in parallel (best effort — don't fail on errors)
  await Promise.allSettled([
    supabase.from("generation_selections").insert({
      generation_run_id: batchId,
      platforms: parsed.data.platforms,
      event_types: parsed.data.eventTypes,
      service_categories: parsed.data.serviceCategories,
    }),
    supabase.from("generated_posts").insert(
      posts.map((post) => ({
        generation_run_id: batchId,
        platform: post.platform,
        framework_used: post.frameworkUsed,
        cta_used: post.ctaUsed,
        post_index: post.postIndex,
        content: post.content,
        image_suggestion: post.imageSuggestion,
        validation_report: post.validationReport,
      })),
    ),
  ]);

  // Increment trial counter (best effort — don't block the response)
  void supabase
    .from("profiles")
    .update({ trial_runs_used: (profile.trial_runs_used ?? 0) + 1 })
    .eq("id", user.id);

  return NextResponse.json({ ok: true, posts, batchId });
}
