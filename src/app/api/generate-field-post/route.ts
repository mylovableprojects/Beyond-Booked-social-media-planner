import { NextResponse } from "next/server";
import { z } from "zod";

import { parseFieldUploadSections, validateFieldUploadOutput } from "@/domain/content-engine/field-upload-rules";
import { humanizeContent } from "@/domain/content-engine/humanization-pass";
import { ANTI_AI_RULES_SECTION } from "@/lib/ai/prompts";
import { FIELD_UPLOAD_COMPOSER_PROMPT } from "@/lib/ai/field-upload-prompt";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileWithLibrariesForSessionUser } from "@/services/repositories/profiles.repository";
import { AnthropicProvider } from "@/services/llm/anthropic";

export const maxDuration = 60;

const bodySchema = z.object({
  workerNotes: z.string().trim().min(1, "workerNotes is required."),
  photoUrl: z.string().url("photoUrl must be a valid URL."),
});

const llm = new AnthropicProvider();

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

  const city = profile.city?.trim() || "your area";

  const brandVoiceLine = profile.brand_notes?.trim()
    ? `Owner voice / brand notes (use only if it fits naturally):\n${profile.brand_notes.trim()}\n`
    : "";

  const fieldContext = `
=== TODAY'S JOB SITE (facts for this post) ===
${brandVoiceLine}
City (light local color only if it fits): ${city}

Photo URL (context only — do not paste the raw URL into the caption):
${parsed.data.photoUrl}

Notes from the field:
"""
${parsed.data.workerNotes}
"""

Safety: No last names, street addresses, or private details not in the notes.
`.trim();

  const system = `${FIELD_UPLOAD_COMPOSER_PROMPT}\n\n${ANTI_AI_RULES_SECTION}`;

  let raw: string;
  try {
    const out = await llm.generate({
      system,
      prompt: fieldContext,
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

  const split = parseFieldUploadSections(raw);
  if (!split) {
    return NextResponse.json(
      {
        error:
          "Could not read [CAPTION] and [HASHTAGS] from the model. Try again or shorten the notes.",
      },
      { status: 502 },
    );
  }

  const caption = humanizeContent(split.caption);
  const hashtags = split.hashtags;

  const validationReport = validateFieldUploadOutput(caption, hashtags);
  if (!validationReport.isValid) {
    return NextResponse.json(
      {
        error: "Generated post did not pass field-upload checks. Try again.",
        details: validationReport.errors,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    caption,
    hashtags,
  });
}
