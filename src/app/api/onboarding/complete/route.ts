import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/onboarding.schema";
import { upsertProfileAndLibraries } from "@/services/repositories/profiles.repository";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = onboardingSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await upsertProfileAndLibraries({
    profileId: user.id,
    businessName: parsed.data.businessName,
    city: parsed.data.city,
    brandNotes: parsed.data.aboutStory,
    customEventTypes: parsed.data.selectedEventTypes,
    customServiceCategories: parsed.data.selectedServiceCategories,
  });

  return NextResponse.json({ ok: true });
}
