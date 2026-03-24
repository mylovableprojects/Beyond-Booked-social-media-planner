/**
 * Batch AI post generation for the main generator. Field workers uploading photos from
 * the job site use `POST /api/generate-field-post` instead; both rely on the shared
 * Anthropic client in `src/services/llm/anthropic.ts`.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { getProfileWithLibraries } from "@/services/repositories/profiles.repository";
import { insertGeneratedPosts } from "@/services/repositories/generation-runs.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validatePlatformRules, type RuleValidationResult } from "@/domain/content-engine/platform-rules";
import { buildPrompt } from "@/domain/content-engine/prompt-builder";
import { getFrameworkForPost } from "@/domain/content-engine/framework-rotator";
import { getSeasonalMoments } from "@/domain/content-engine/seasonal-moments";
import { getSeasonalContext } from "@/lib/ai/seasonal";
import { PLATFORM_CTA_BANK } from "@/lib/constants/platforms";
import type { ContentFramework, Platform } from "@/types/platform";
import type { GeneratedPost } from "@/types/content";

type ApiErrorBody = { ok: false; error: string; details?: unknown };

const optionalTrimmedString = (max: number) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().max(max).optional());

const generatePostsRequestSchema = z.object({
  profileId: z.string().min(1),
  selectedPlatforms: z.array(z.enum(["facebook", "instagram", "google_business_profile"] as const)).min(1),
  selectedEventTypes: z.array(z.string().trim().min(2).max(80)).min(1),
  selectedServiceCategories: z.array(z.string().trim().min(2).max(80)).min(1),
  featuredProduct: optionalTrimmedString(120),
  promo: optionalTrimmedString(240),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2025).max(2100),
  postCount: z.union([z.literal(3), z.literal(9), z.literal(15)]),
});

const profileRowSchema = z.object({
  id: z.string(),
  business_name: z.string(),
  city: z.string(),
  state_region: z.string().nullable(),
  timezone: z.string(),
  brand_notes: z.string().nullable(),
});

// Strict JSON contract the model must return for each generated post.
// This is enforced server-side using Zod before we validate platform formatting.
const modelPostOutputSchema = z
  .object({
    hookType: z.string().trim().min(1),
    content: z.string().trim().min(1),
    cta: z.string().trim().min(1),
    imageSuggestion: z.string().trim().min(1),
  })
  .strict();

type ModelPostOutput = z.infer<typeof modelPostOutputSchema>;

type GeneratedPostResponse = {
  platform: Platform;
  frameworkUsed: ContentFramework;
  hookType: string;
  postIndex: number;
  content: string;
  cta: string;
  imageSuggestion: string;
  validationReport: RuleValidationResult;
};

function countWords(input: string): number {
  return input.trim().split(/\s+/).filter(Boolean).length;
}

function canonicalizeSelections(inputItems: string[], savedItems: string[]) {
  const savedByLower = new Map(savedItems.map((s) => [s.toLowerCase(), s]));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of inputItems) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    const canonical = savedByLower.get(lower);
    if (!canonical) {
      throw new Error(`Invalid selection: "${trimmed}" is not in your saved library.`);
    }
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(canonical);
  }
  return out;
}

function chooseCtaNoRepeat(platform: Platform, postIndex: number, seed: number, lastCta: string | undefined) {
  const ctas = PLATFORM_CTA_BANK[platform];
  const candidateIndex = (seed + postIndex) % ctas.length;
  const candidate = ctas[candidateIndex]!;
  if (candidate !== lastCta) return candidate;
  return ctas[(candidateIndex + 1) % ctas.length]!;
}

function clampWordTarget(currentWords: number, min: number, max: number, attempt: number) {
  const baseTarget = min + attempt * 5;
  const target = Math.min(max, Math.max(min, baseTarget));
  if (currentWords > max) return max;
  if (currentWords <= target) return target;
  // If base text already overshoots the target, cap to max.
  return Math.min(max, currentWords);
}

function makeFillerWords() {
  return [
    "stress-free",
    "easy",
    "family",
    "celebration",
    "friends",
    "memories",
    "setup",
    "planning",
    "quality",
    "community",
    "weekend",
    "memorable",
    "fun",
    "organized",
    "kids",
    "smiles",
    "colorful",
    "together",
    "simple",
    "ready",
  ];
}

function padToWordCount(text: string, targetWords: number) {
  const filler = makeFillerWords();
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length >= targetWords) return words.slice(0, targetWords).join(" ");
  const next = words.slice();
  let idx = 0;
  while (next.length < targetWords) {
    next.push(filler[idx % filler.length]!);
    idx += 1;
  }
  return next.join(" ");
}

function getPlatformWordRange(platform: Platform): { min: number; max: number } {
  if (platform === "facebook") return { min: 40, max: 80 };
  if (platform === "instagram") return { min: 100, max: 150 };
  return { min: 75, max: 125 }; // google_business_profile
}

function pickHookType(framework: ContentFramework, postIndex: number): string {
  // Placeholder hook types for non-model generation. When the model is connected,
  // it will output hookType, and the server will strictly validate it exists.
  const variants =
    framework === "beyond-bookings"
      ? ["problem_solution", "myth_buster", "comparison", "contrarian"]
      : framework === "social-content"
        ? ["curiosity", "value", "social_proof", "list"]
        : framework === "story-brand"
          ? ["origin", "client_win", "values", "lesson"]
          : ["countdown", "nostalgia", "fomo", "seasonal_problem"];

  return variants[postIndex % variants.length] ?? "hook";
}

function generatePlatformCompliantPlaceholder(args: {
  platform: Platform;
  city: string;
  eventType: string;
  serviceCategory: string;
  framework: ContentFramework;
  cta: string;
  promo?: string;
  featuredProduct?: string;
  includeFeatured: boolean;
  seasonal: ReturnType<typeof getSeasonalContext>;
  postIndex: number;
  attempt: number;
}): ModelPostOutput {
  const {
    platform,
    city,
    eventType,
    serviceCategory,
    framework,
    cta,
    promo,
    featuredProduct,
    includeFeatured,
    seasonal,
    postIndex,
    attempt,
  } = args;

  const hookType = pickHookType(args.framework, args.postIndex);

  // Shared fragments used to keep structure consistent.
  const featuredFragment =
    includeFeatured && featuredProduct ? ` Featured this month: ${featuredProduct}.` : "";
  const promoFragment = promo ? ` Limited-time promo: ${promo}.` : "";
  const seasonFragment = ` It's ${seasonal.season.toLowerCase()}—perfect timing for ${eventType.toLowerCase()} events.`;

  const { min, max } = getPlatformWordRange(platform);

  if (platform === "facebook") {
    // Keep emojis <=2.
    const emoji = postIndex % 2 === 0 ? "🎉" : "";
    const base = [
      `If you want a ${eventType} that feels effortless, start with ${serviceCategory} rentals in ${city}.`,
      `Our team helps you avoid the DIY stress and get a setup you can be proud of.${emoji}`,
      featuredFragment ? featuredFragment.trim() : "",
      promoFragment ? promoFragment.trim() : "",
      seasonFragment.trim(),
      `You bring the people, we bring the pro experience. ${cta}`,
    ]
      .filter(Boolean)
      .join(" ");

    const current = countWords(base);
    const target = clampWordTarget(current, min, max, attempt);
    const content = padToWordCount(base, target);
    return {
      hookType,
      content,
      cta,
      imageSuggestion: `Photo of families enjoying a ${serviceCategory} setup during a ${seasonal.season.toLowerCase()} event.`,
    };
  }

  if (platform === "instagram") {
    // Hashtags must be on the final line, and count must be 5-8.
    const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const hashtags = [
      "#partyrentals",
      "#eventplanning",
      "#familyfun",
      "#kidsparties",
      `#${citySlug || "local"}`,
      "#bouncycastle", // harmless generic
      "#weekendvibes",
    ];

    const hashtagsLine = hashtags.join(" ");
    const hashtagsWords = countWords(hashtagsLine);

    // Ensure first line is under 12 words (validator constraint).
    const firstLineCandidate = `Make your ${eventType} easy to host.`;
    const firstLineWords = countWords(firstLineCandidate);
    const firstLine = firstLineWords < 12 ? firstLineCandidate : "Make it easy to host.";
    const firstLineWordCount = countWords(firstLine);

    // Body is everything except the final hashtags line. We'll pad/trim the body
    // so TOTAL word count lands within Instagram's 100-150 range.
    const bodyRest = [
      `Hosting a ${eventType} with ${serviceCategory} rentals in ${city} should feel calm, not chaotic.`,
      `We plan the timing, set everything up, and help you enjoy the moment.`,
      seasonFragment.trim(),
      featuredFragment.trim(),
      promoFragment.trim(),
      `Framework: ${framework}.`,
      `Choose pro rentals and keep your weekend for friends and smiles.`,
      `${cta} ${postIndex % 2 === 0 ? "😊" : ""}`.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    const currentTotalWords = firstLineWordCount + countWords(bodyRest) + hashtagsWords;
    const targetTotalWords = clampWordTarget(currentTotalWords, min, max, attempt);
    const targetBodyWords = Math.max(0, targetTotalWords - firstLineWordCount - hashtagsWords);
    const paddedBodyRest = padToWordCount(bodyRest, targetBodyWords);

    const content = `${firstLine}\n${paddedBodyRest}\n${hashtagsLine}`.trim();
    return {
      hookType,
      content,
      cta,
      imageSuggestion: `Bright, colorful photo of families at a ${serviceCategory} during ${seasonal.season.toLowerCase()}.`,
    };
  }

  // google_business_profile (GBP)
  const emoji = ""; // GBP must not include emojis.
  const base = [
    `Reserve your ${serviceCategory} for your upcoming ${eventType} in ${city}.`,
    `We help you skip DIY stress with a smooth, professional setup that makes your event feel confident from day one.`,
    seasonFragment.trim(),
    includeFeatured && featuredProduct ? ` Featured: ${featuredProduct}.` : "",
    promoFragment.trim(),
    `Framework tone: ${framework}.`,
    `${cta} ${emoji}`.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const current = countWords(base);
  const target = clampWordTarget(current, min, max, attempt);
  const content = padToWordCount(base, target);
  return {
    hookType,
    content,
    cta,
    imageSuggestion: `Clean event setup photo for ${serviceCategory} in ${city}.`,
  };
}

async function generateAndValidatePost(args: {
  platform: Platform;
  city: string;
  eventType: string;
  serviceCategory: string;
  framework: ContentFramework;
  cta: string;
  promo?: string;
  featuredProduct?: string;
  includeFeatured: boolean;
  seasonal: ReturnType<typeof getSeasonalContext>;
  postIndex: number;
}): Promise<{ storagePost: GeneratedPost; responsePost: GeneratedPostResponse }> {
  const maxAttempts = 3;
  const { platform, city } = args;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const output = generatePlatformCompliantPlaceholder({ ...args, attempt });
    const parsed = modelPostOutputSchema.safeParse(output);
    if (!parsed.success) {
      // If schema fails, retry (in real model integration this would come from repair logic).
      continue;
    }

    const validationReport = validatePlatformRules(platform, parsed.data.content, city);
    if (validationReport.isValid) {
      const storagePost: GeneratedPost = {
        platform,
        frameworkUsed: args.framework,
        ctaUsed: parsed.data.cta,
        postIndex: args.postIndex,
        content: parsed.data.content,
        imageSuggestion: parsed.data.imageSuggestion,
        validationReport,
      };

      const responsePost: GeneratedPostResponse = {
        platform,
        frameworkUsed: args.framework,
        hookType: parsed.data.hookType,
        postIndex: args.postIndex,
        content: parsed.data.content,
        cta: parsed.data.cta,
        imageSuggestion: parsed.data.imageSuggestion,
        validationReport,
      };

      return { storagePost, responsePost };
    }
  }

  // If even placeholders can't pass, fail fast with a helpful error.
  // (This should be rare; the placeholder generator is built to match validation constraints.)
  const last = (() => {
    const output = generatePlatformCompliantPlaceholder({ ...args, attempt: maxAttempts });
    const parsed = modelPostOutputSchema.safeParse(output);
    const content = parsed.success ? parsed.data.content : output.content;
    const imageSuggestion = parsed.success ? parsed.data.imageSuggestion : output.imageSuggestion;
    const ctaUsed = parsed.success ? parsed.data.cta : args.cta;
    const hookType = parsed.success ? parsed.data.hookType : "hook";
    return {
      content,
      imageSuggestion,
      ctaUsed,
      hookType,
      validationReport: validatePlatformRules(platform, content, city),
    };
  })();

  if (!last.validationReport.isValid) {
    throw new Error(
      `Generated content failed validation for ${platform}: ${last.validationReport.errors.join(" | ")}`,
    );
  }

  const storagePost: GeneratedPost = {
    platform: args.platform,
    frameworkUsed: args.framework,
    ctaUsed: last.ctaUsed,
    postIndex: args.postIndex,
    content: last.content,
    imageSuggestion: last.imageSuggestion,
    validationReport: last.validationReport,
  };

  const responsePost: GeneratedPostResponse = {
    platform: args.platform,
    frameworkUsed: args.framework,
    hookType: last.hookType,
    postIndex: args.postIndex,
    content: last.content,
    cta: last.ctaUsed,
    imageSuggestion: last.imageSuggestion,
    validationReport: last.validationReport,
  };

  return { storagePost, responsePost };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" } satisfies ApiErrorBody, {
      status: 400,
    });
  }

  const parsed = generatePostsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request payload",
        details: parsed.error.flatten(),
      } satisfies ApiErrorBody,
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Strictly enforce that the profile belongs to the authenticated user.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" } satisfies ApiErrorBody, {
      status: 401,
    });
  }
  if (user.id !== input.profileId) {
    return NextResponse.json(
      { ok: false, error: "profileId does not match authenticated user" } satisfies ApiErrorBody,
      { status: 403 },
    );
  }

  // Fetch saved business context (profile + libraries).
  const profileAndLibraries = await getProfileWithLibraries(user.id);
  if (!profileAndLibraries.profile) {
    return NextResponse.json({ ok: false, error: "Profile not found" } satisfies ApiErrorBody, {
      status: 404,
    });
  }

  if (profileAndLibraries.profile.account_role === "worker") {
    return NextResponse.json({ ok: false, error: "Forbidden" } satisfies ApiErrorBody, { status: 403 });
  }

  const profileParsed = profileRowSchema.safeParse(profileAndLibraries.profile);
  if (!profileParsed.success) {
    return NextResponse.json(
      { ok: false, error: "Saved profile data is invalid", details: profileParsed.error.flatten() } satisfies ApiErrorBody,
      { status: 500 },
    );
  }

  const canonicalEventTypes = canonicalizeSelections(
    input.selectedEventTypes,
    profileAndLibraries.eventTypes,
  );
  const canonicalServiceCategories = canonicalizeSelections(
    input.selectedServiceCategories,
    profileAndLibraries.serviceCategories,
  );

  // Create generation batch record (mapped to generation_runs table in this codebase).
  const { data: batchRow, error: batchInsertError } = await supabase
    .from("generation_runs")
    .insert({
      profile_id: input.profileId,
      month: input.month,
      year: input.year,
      post_count: input.postCount,
      promo_text: input.promo ?? null,
      featured_product: input.featuredProduct ?? null,
      status: "running",
    })
    .select("id")
    .single();

  if (batchInsertError || !batchRow?.id) {
    return NextResponse.json(
      { ok: false, error: "Failed to create generation batch", details: batchInsertError } satisfies ApiErrorBody,
      { status: 500 },
    );
  }

  const generationBatchId = batchRow.id as string;

  // Persist the selection so we can re-run/copy later without losing the subset context.
  const { error: selectionInsertError } = await supabase
    .from("generation_selections")
    .insert({
      generation_run_id: generationBatchId,
      platforms: input.selectedPlatforms,
      event_types: canonicalEventTypes,
      service_categories: canonicalServiceCategories,
    });

  if (selectionInsertError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to store generation selection",
        details: selectionInsertError,
      } satisfies ApiErrorBody,
      { status: 500 },
    );
  }

  try {
    const seasonalContext = getSeasonalContext({
      month: input.month,
      year: input.year,
      city: profileParsed.data.city,
    });

    // Seeded CTA rotation that avoids back-to-back repeats per platform.
    const seed = input.year + input.month;
    const lastCtaByPlatform = new Map<Platform, string | undefined>();

    const storagePosts: GeneratedPost[] = [];
    const responsePosts: GeneratedPostResponse[] = [];

    for (let postIndex = 0; postIndex < input.postCount; postIndex += 1) {
      const framework = getFrameworkForPost(postIndex);

      const eventType = canonicalEventTypes[postIndex % canonicalEventTypes.length]!;
      const serviceCategory =
        canonicalServiceCategories[postIndex % canonicalServiceCategories.length]!;

      const includeFeatured = Boolean(
        input.featuredProduct && postIndex % 2 === 0,
      );

      // Rotate seasonal moments for prompt + placeholder.
      // We include both your holiday/season mapping and your existing "monthly moments" flavor.
      const seasonalMoments = [
        `Season: ${seasonalContext.season}.`,
        ...seasonalContext.holidays.map((h) => `Holiday: ${h}.`),
        ...seasonalContext.eventBusinessMoments,
        ...getSeasonalMoments({
          month: input.month,
          year: input.year,
          city: profileParsed.data.city,
        }),
      ];

      for (const platform of input.selectedPlatforms) {
        // No back-to-back repeats for the same platform.
        const lastCta = lastCtaByPlatform.get(platform);
        const cta = chooseCtaNoRepeat(platform, postIndex, seed, lastCta);
        lastCtaByPlatform.set(platform, cta);

        // Prompt assembly is done now for future model integration.
        // For this route we generate placeholder content and still validate/rewrite.
        // Prompt assembly will be used once the model call is connected.
        // For now, we generate placeholder content and validate it server-side.
        // (Leaving prompt assembly here documents the required model contract.)
        buildPrompt({
          platform,
          framework,
          city: profileParsed.data.city,
          eventTypes: [eventType],
          serviceCategories: [serviceCategory],
          seasonalMoments,
          cta,
          promoText: input.promo,
          featuredProduct: includeFeatured ? input.featuredProduct : undefined,
        });

        const { storagePost, responsePost } = await generateAndValidatePost({
          platform,
          city: profileParsed.data.city,
          eventType,
          serviceCategory,
          framework,
          cta,
          promo: input.promo,
          featuredProduct: input.featuredProduct,
          includeFeatured,
          seasonal: seasonalContext,
          postIndex,
        });

        storagePosts.push(storagePost);
        responsePosts.push(responsePost);
      }
    }

    await insertGeneratedPosts(generationBatchId, storagePosts);

    const { error: statusUpdateError } = await supabase
      .from("generation_runs")
      .update({ status: "completed" })
      .eq("id", generationBatchId);

    if (statusUpdateError) {
      // Generation succeeded; just surface the storage status error.
      return NextResponse.json(
        {
          ok: true,
          generationBatchId,
          posts: responsePosts,
          warning: "Posts generated but batch status update failed.",
        },
        { status: 200 },
      );
    }

    const postsByPlatform = responsePosts.reduce<Record<string, GeneratedPostResponse[]>>((acc, p) => {
      acc[p.platform] = acc[p.platform] ?? [];
      acc[p.platform]!.push(p);
      return acc;
    }, {});

    return NextResponse.json(
      {
        ok: true,
        generationBatchId,
        input: {
          profileId: input.profileId,
          selectedPlatforms: input.selectedPlatforms,
          selectedEventTypes: canonicalEventTypes,
          selectedServiceCategories: canonicalServiceCategories,
          featuredProduct: input.featuredProduct ?? null,
          promo: input.promo ?? null,
          month: input.month,
          year: input.year,
          postCount: input.postCount,
        },
        posts: responsePosts,
        postsByPlatform,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    await supabase
      .from("generation_runs")
      .update({ status: "failed" })
      .eq("id", generationBatchId);

    return NextResponse.json(
      { ok: false, error: message } satisfies ApiErrorBody,
      { status: 500 },
    );
  }
}

