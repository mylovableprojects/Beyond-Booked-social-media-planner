import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  workerName: z.string().trim().min(1),
  rawNotes: z.string().trim().min(1),
  generatedCaption: z.string().trim().min(1),
  hashtags: z.string().trim().min(1),
  photoUrl: z.string().url(),
  photoPath: z.string().trim().min(1),
  eventType: z.string().trim().max(120).optional().nullable(),
});

/**
 * Inserts into field_uploads using the authenticated session (cookies).
 * Avoids browser/client mismatches where worker_id must equal auth.uid() for RLS.
 */
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

  const { error } = await supabase.from("field_uploads").insert({
    worker_name: parsed.data.workerName,
    worker_id: user.id,
    raw_notes: parsed.data.rawNotes,
    generated_caption: parsed.data.generatedCaption,
    hashtags: parsed.data.hashtags,
    photo_url: parsed.data.photoUrl,
    photo_path: parsed.data.photoPath,
    event_type: parsed.data.eventType ?? null,
    source: "field_upload",
    status: "draft",
  });

  if (error) {
    console.error("field_upload save", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
