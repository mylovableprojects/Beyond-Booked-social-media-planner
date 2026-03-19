import { NextResponse } from "next/server";

import { profileSchema } from "@/lib/validation/profile.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getProfileWithLibraries,
  upsertProfileAndLibraries,
} from "@/services/repositories/profiles.repository";

function parseListInput(value: string) {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJsonArrayOrList(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      // Fall through to list parsing.
    }
  }

  return parseListInput(trimmed);
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getProfileWithLibraries(user.id);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const selectedEventTypes = parseJsonArrayOrList(
    String(formData.get("selectedEventTypes") ?? ""),
  );
  const selectedServiceCategories = parseJsonArrayOrList(
    String(formData.get("selectedServiceCategories") ?? ""),
  );

  if (selectedEventTypes.length === 0 || selectedServiceCategories.length === 0) {
    return NextResponse.redirect(new URL("/profile?error=invalid_selection", request.url));
  }

  const parsed = profileSchema.safeParse({
    businessName: String(formData.get("businessName") ?? ""),
    city: String(formData.get("city") ?? ""),
    stateRegion: String(formData.get("stateRegion") ?? ""),
    timezone: String(formData.get("timezone") ?? "America/Chicago"),
    brandNotes: String(formData.get("brandNotes") ?? ""),
    selectedEventTypes,
    selectedServiceCategories,
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/profile?error=invalid_profile", request.url));
  }

  try {
    await upsertProfileAndLibraries({
      profileId: user.id,
      businessName: parsed.data.businessName,
      city: parsed.data.city,
      stateRegion: parsed.data.stateRegion,
      timezone: parsed.data.timezone,
      brandNotes: parsed.data.brandNotes,
      selectedEventTypes: parsed.data.selectedEventTypes,
      selectedServiceCategories: parsed.data.selectedServiceCategories,
    });
  } catch {
    return NextResponse.redirect(new URL("/profile?error=save_failed", request.url));
  }

  return NextResponse.redirect(new URL("/profile?saved=1", request.url));
}
