import { NextResponse } from "next/server";
import { z } from "zod";

import { buildPrompt } from "@/domain/content-engine/prompt-builder";
import { getCtaForPost } from "@/domain/content-engine/cta-rotator";
import { humanizeContent } from "@/domain/content-engine/humanization-pass";
import { validatePlatformRules } from "@/domain/content-engine/platform-rules";
import { getSeasonalMoments } from "@/domain/content-engine/seasonal-moments";
import { ANTI_AI_RULES_SECTION, FRAMEWORK_PROMPTS } from "@/lib/ai/prompts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileWithLibrariesForSessionUser } from "@/services/repositories/profiles.repository";
import { AnthropicProvider } from "@/services/llm/anthropic";

export const maxDuration = 60;

const FIELD_PLATFORM = "instagram" as const;

const bodySchema = z.object({
  workerNotes: z.string().trim().min(1, "workerNotes is required."),
  photoUrl: z.string().url("photoUrl must be a valid URL."),
});

const modelPostOutputSchema = z
  .object({
    hookType: z.string().trim().min(1),
    content: z.string().trim().min(1),
    cta: z.string().trim().min(1),
    imageSuggestion: z.string().trim().min(1),
  })
  .strict();

const llm = new AnthropicProvider();

function splitInstagramCaptionAndHashtags(content: string): { caption: string; hashtags: string } | null {
  const trimmed = content.trim();
  const blocks = trimmed
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length < 2) return null;
  const last = blocks[blocks.length - 1]!;
  const tokens = last.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const allHash = tokens.every((t) => /^#[A-Za-z0-9_]+$/.test(t));
  if (!allHash) return null;
  return {
    caption: blocks.slice(0, -1).join("\n\n"),
    hashtags: last,
  };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { profile, eventTypes, serviceCategories, sessionAccountRole, sessionEmployerProfileId } =
    await getProfileWithLibrariesForSessionUser(user.id);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (sessionAccountRole === "worker" && !sessionEmployerProfileId) {
    return NextResponse.json(
      { error: "Worker account is not linked to a business profile." },
      { status: 403 },
    );
  }

  if (eventTypes.length === 0 || serviceCategories.length === 0) {
    return NextResponse.json(
      {
        error:
          "This business profile needs at least one event type and one service category (owner: complete Profile).",
      },
      { status: 400 },
    );
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const city = profile.city?.trim() || "your area";

  const seasonalMoments = getSeasonalMoments({ month, year, city });
  const cta = getCtaForPost(FIELD_PLATFORM, 0, year * 100 + month);

  const generatorAlignedPrompt = buildPrompt({
    platform: FIELD_PLATFORM,
    framework: "beyond-bookings",
    city,
    eventTypes,
    serviceCategories,
    seasonalMoments,
    cta,
    promoText: undefined,
    featuredProduct: undefined,
  });

  const brandVoiceLine = profile.brand_notes?.trim()
    ? `Owner voice / brand notes (use only if it fits naturally):\n${profile.brand_notes.trim()}\n`
    : "";

  const fieldContext = `
=== FIELD CAPTURE (today's job site) ===
A team member uploaded a photo and quick notes. Use this as the real scene for this post.
Write ONE Instagram post following every rule above (Beyond Bookings angle: emotional outcome and transformation, not equipment specs).

${brandVoiceLine}
Photo URL (context only — do not paste the raw URL into the post unless it genuinely helps):
${parsed.data.photoUrl}

Notes from the field:
"""
${parsed.data.workerNotes}
"""

Safety: Do not include any client's last name or private street address. If the notes do not give a safe location, keep geography general.
`.trim();

  const system = [FRAMEWORK_PROMPTS["beyond-bookings"], ANTI_AI_RULES_SECTION].filter(Boolean).join("\n\n");

  const userPrompt = `${generatorAlignedPrompt}\n\n${fieldContext}`;

  let raw: string;
  try {
    const out = await llm.generate({
      system,
      prompt: userPrompt,
      maxTokens: 2048,
    });
    raw = out.content;
  } catch (e) {
    console.error("generate-field-post", e);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 },
    );
  }

  let content: string;
  try {
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsedOut = modelPostOutputSchema.safeParse(JSON.parse(stripped));
    if (!parsedOut.success) {
      return NextResponse.json(
        { error: "Could not parse model response. Please try again." },
        { status: 502 },
      );
    }
    content = parsedOut.data.content;
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON. Please try again." },
      { status: 502 },
    );
  }

  content = humanizeContent(content);
  const validationReport = validatePlatformRules(FIELD_PLATFORM, content, city);
  if (!validationReport.isValid) {
    return NextResponse.json(
      {
        error: "Generated post did not pass the same platform checks as the main generator. Try again.",
        details: validationReport.errors,
      },
      { status: 502 },
    );
  }

  const split = splitInstagramCaptionAndHashtags(content);
  if (!split) {
    return NextResponse.json(
      {
        error: "Could not separate caption and hashtag line. Please try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    caption: split.caption,
    hashtags: split.hashtags,
  });
}
