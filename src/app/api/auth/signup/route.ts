import { NextResponse } from "next/server";

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const firstName    = String(formData.get("first_name")    ?? "").trim();
  const lastName     = String(formData.get("last_name")     ?? "").trim();
  const businessName = String(formData.get("business_name") ?? "").trim();
  const email        = String(formData.get("email")         ?? "").trim();
  const password     = String(formData.get("password")      ?? "");

  const origin = new URL(request.url).origin;

  if (!firstName || !lastName || !businessName || !email || !password) {
    return NextResponse.redirect(new URL("/signup?error=missing_fields", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: { first_name: firstName, last_name: lastName, business_name: businessName },
    },
  });

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(error?.message ?? "Signup failed")}`, request.url),
    );
  }

  // Create a partial profile immediately using the admin client (bypasses RLS).
  // City is intentionally blank here — onboarding fills it in.
  const admin = createSupabaseAdminClient();
  await admin.from("profiles").upsert(
    {
      id:            data.user.id,
      first_name:    firstName,
      last_name:     lastName,
      business_name: businessName,
      city:          "",
      timezone:      "America/Chicago",
    },
    { onConflict: "id" },
  );

  // Fire HighLevel webhook — best effort, don't block signup on failure
  void fetch(
    "https://services.leadconnectorhq.com/hooks/1jQA3wVVe39Qvmd8gF84/webhook-trigger/e53f0e19-09c1-4b30-a41c-9ffbc18dcc43",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName:   firstName,
        lastName:    lastName,
        email:       email,
        companyName: businessName,
        source:      "social-media-planner",
      }),
    },
  ).catch(() => {
    // Silently ignore — webhook failure should never break signup
  });

  return NextResponse.redirect(new URL("/login?registered=1", request.url));
}
