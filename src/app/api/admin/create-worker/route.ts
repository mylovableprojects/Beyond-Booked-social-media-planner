import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

const bodySchema = z.object({
  employerProfileId: z.string().uuid(),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
});

/**
 * Platform super-admin only: create a field-worker login tied to a business owner's profile.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: me } = await admin.from("profiles").select("is_admin").eq("id", user.id).maybeSingle<Pick<ProfileRow, "is_admin">>();
  if (!me?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { employerProfileId } = parsed.data;

  const { data: employer, error: empErr } = await admin.from("profiles").select("*").eq("id", employerProfileId).maybeSingle<ProfileRow>();

  if (empErr || !employer) {
    return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
  }

  if ((employer.account_role ?? "owner") === "worker") {
    return NextResponse.json({ error: "Choose a business owner account, not another worker." }, { status: 400 });
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: false,
    user_metadata: {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
    },
  });

  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Could not create login. Email may already be in use." },
      { status: 400 },
    );
  }

  const newId = created.user.id;

  const { error: profileErr } = await admin.from("profiles").insert({
    id: newId,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    business_name: employer.business_name,
    city: employer.city,
    state_region: employer.state_region,
    timezone: employer.timezone,
    brand_notes: employer.brand_notes,
    trial_runs_used: 0,
    is_admin: false,
    is_support_admin: false,
    account_role: "worker",
    employer_profile_id: employerProfileId,
    subscription_status: "canceled",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_expires_at: null,
  });

  if (profileErr) {
    await admin.auth.admin.deleteUser(newId);
    return NextResponse.json(
      {
        error: profileErr.message,
        hint:
          profileErr.message.includes("employer_profile_id") || profileErr.message.includes("account_role")
            ? "Run the SQL migration supabase/migrations/202603260001_account_roles_workers_support.sql in Supabase."
            : undefined,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, userId: newId });
}
