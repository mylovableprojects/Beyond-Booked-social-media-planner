import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toHighLevelCsv } from "@/domain/export/highlevel-csv";
import type { GeneratedPost } from "@/types/content";
import type { Platform } from "@/types/platform";

const exportRequestSchema = z.object({
  batchId: z.string().min(1),
  platform: z.enum(["facebook", "instagram", "google_business_profile"]),
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

  const { batchId, platform } = parsedBody.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: batch, error: batchError } = await supabase
    .from("generation_runs")
    .select("id, month, year")
    .eq("id", batchId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (batchError) {
    return NextResponse.json({ error: "Failed to load batch." }, { status: 500 });
  }

  if (!batch) {
    return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  }

  const { data: rows, error: postsError } = await supabase
    .from("generated_posts")
    .select(
      "platform, framework_used, cta_used, post_index, content, image_suggestion, validation_report",
    )
    .eq("generation_run_id", batchId)
    .eq("platform", platform)
    .order("post_index", { ascending: true });

  if (postsError) {
    return NextResponse.json({ error: "Failed to load posts." }, { status: 500 });
  }

  type GeneratedPostRow = {
    platform: GeneratedPost["platform"];
    framework_used: GeneratedPost["frameworkUsed"];
    cta_used: GeneratedPost["ctaUsed"];
    post_index: GeneratedPost["postIndex"];
    content: GeneratedPost["content"];
    image_suggestion: GeneratedPost["imageSuggestion"];
    validation_report: GeneratedPost["validationReport"];
  };

  const posts: GeneratedPost[] = (rows ?? []).map((row: GeneratedPostRow) => ({
    platform: row.platform as Platform,
    frameworkUsed: row.framework_used,
    ctaUsed: row.cta_used,
    postIndex: row.post_index,
    content: row.content,
    imageSuggestion: row.image_suggestion,
    validationReport: row.validation_report,
  }));

  const csv = toHighLevelCsv(posts, batch.month, batch.year);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="highlevel-${platform}-export.csv"`,
    },
  });
}
