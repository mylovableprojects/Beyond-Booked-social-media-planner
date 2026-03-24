import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnthropicProvider } from "@/services/llm/anthropic";

export const maxDuration = 60;

const FIELD_POST_MODEL = "claude-sonnet-4-20250514";

const FIELD_POST_SYSTEM_PROMPT = `You are a social media content creator for a party rental business. Your job is to turn a 
field worker's quick photo description into a warm, engaging, and beautifully written 
social media post optimized for Facebook and Instagram.

The worker will give you a short description of what they're doing — this might include 
the type of setup, the event type, the client's name (if shared), the location, or 
anything else they want to highlight.

Using their description, write a social media post that:

1. CAPTION: Write 3–5 sentences in a warm, community-focused tone. Make it feel human, 
   celebratory, and behind-the-scenes authentic. Highlight the excitement of the event, 
   the care put into the setup, and the joy it will bring guests. Vary the structure 
   occasionally.

2. EMOJIS: Sprinkle 4–8 relevant emojis naturally throughout the caption.

3. HASHTAGS: End with 10–15 hashtags mixing broad, niche, and event-specific tags. 
   Always include #PartyRentalBusiness and #PartyRentalToolkit.

FORMAT your response exactly like this:

[CAPTION]
(caption text with emojis woven in)

[HASHTAGS]
(hashtag list)

Important rules:
- Never mention any client's last name or private address
- If no location is given, keep it general
- Always sound like a real person, not a robot`;

const bodySchema = z.object({
  workerNotes: z.string().trim().min(1, "workerNotes is required."),
  photoUrl: z.string().url("photoUrl must be a valid URL."),
});

const llm = new AnthropicProvider();

function parseCaptionAndHashtags(raw: string): { caption: string; hashtags: string } | null {
  const text = raw.trim();
  const capRe = /\[CAPTION\]/i;
  const hashRe = /\[HASHTAGS\]/i;
  const capMatch = capRe.exec(text);
  const hashMatch = hashRe.exec(text);
  if (!capMatch || !hashMatch || capMatch.index === undefined || hashMatch.index === undefined) {
    return null;
  }
  if (hashMatch.index <= capMatch.index) {
    return null;
  }
  const caption = text.slice(capMatch.index + capMatch[0].length, hashMatch.index).trim();
  const hashtags = text.slice(hashMatch.index + hashMatch[0].length).trim();
  if (!caption || !hashtags) {
    return null;
  }
  return { caption, hashtags };
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

  const userPrompt = `Photo (public URL — use only as context; do not paste the raw URL into the caption unless it genuinely helps):
${parsed.data.photoUrl}

Worker's description:
"""
${parsed.data.workerNotes}
"""`;

  let content: string;
  try {
    const out = await llm.generate({
      system: FIELD_POST_SYSTEM_PROMPT,
      model: FIELD_POST_MODEL,
      maxTokens: 2048,
      prompt: userPrompt,
    });
    content = out.content;
  } catch (e) {
    console.error("generate-field-post", e);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 },
    );
  }

  const sections = parseCaptionAndHashtags(content);
  if (!sections) {
    return NextResponse.json(
      { error: "Could not parse AI response. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    caption: sections.caption,
    hashtags: sections.hashtags,
  });
}
