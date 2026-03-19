import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/db";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, business_name, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle<Pick<ProfileRow, "stripe_customer_id" | "business_name" | "first_name" | "last_name">>();

  const origin = new URL(request.url).origin;

  // Reuse existing Stripe customer or create a new one
  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
    const customer = await stripe.customers.create({
      email: authUser?.user?.email ?? undefined,
      name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.business_name || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/dashboard`,
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
