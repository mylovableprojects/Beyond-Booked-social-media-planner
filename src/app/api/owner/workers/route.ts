import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ownerCanUsePaidFeatures } from "@/lib/auth/subscription-access";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

const createSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("account_role, is_admin, subscription_status, trial_runs_used")
    .eq("id", user.id)
    .maybeSingle<
      Pick<ProfileRow, "account_role" | "is_admin" | "subscription_status" | "trial_runs_used">
    >();

  if (!me || me.account_role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!ownerCanUsePaidFeatures(me)) {
    return NextResponse.json({ error: "Subscription or active trial required to manage workers." }, { status: 402 });
  }

  const admin = createSupabaseAdminClient();
  const { data: workers, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, created_at")
    .eq("employer_profile_id", user.id)
    .eq("account_role", "worker")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = workers ?? [];
  const emails: Record<string, string> = {};
  await Promise.all(
    rows.map(async (w) => {
      const { data: authUser } = await admin.auth.admin.getUserById(w.id);
      emails[w.id] = authUser.user?.email ?? "";
    }),
  );

  return NextResponse.json({
    workers: rows.map((w) => ({
      id: w.id,
      first_name: w.first_name,
      last_name: w.last_name,
      created_at: w.created_at,
      email: emails[w.id] ?? "",
    })),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (!me || me.account_role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!ownerCanUsePaidFeatures(me)) {
    return NextResponse.json({ error: "Subscription or active trial required to add workers." }, { status: 402 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

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
    business_name: me.business_name,
    city: me.city,
    state_region: me.state_region,
    timezone: me.timezone,
    brand_notes: me.brand_notes,
    trial_runs_used: 0,
    is_admin: false,
    is_support_admin: false,
    account_role: "worker",
    employer_profile_id: user.id,
    subscription_status: "canceled",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_expires_at: null,
  });

  if (profileErr) {
    await admin.auth.admin.deleteUser(newId);
    return NextResponse.json({ error: profileErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId: newId });
}
