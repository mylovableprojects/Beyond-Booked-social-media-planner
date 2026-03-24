import { NextResponse } from "next/server";

import { toFieldUploadStandaloneHtml } from "@/domain/export/field-upload-html";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: row, error } = await supabase
    .from("field_uploads")
    .select(
      "id, created_at, worker_name, raw_notes, generated_caption, hashtags, photo_url, worker_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    return new NextResponse("Capture not found", { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, city")
    .eq("id", row.worker_id)
    .maybeSingle();

  const caption = row.generated_caption ?? "";
  const hashtags = row.hashtags ?? "";

  const html = toFieldUploadStandaloneHtml({
    businessName: profile?.business_name ?? "Business",
    city: profile?.city ?? "",
    workerName: row.worker_name,
    createdAt: row.created_at,
    photoUrl: row.photo_url,
    rawNotes: row.raw_notes,
    caption,
    hashtags,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
