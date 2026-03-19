import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const config = { api: { bodyParser: false } };

async function getSupabaseUserIdFromCustomer(customerId: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle<{ id: string }>();
  return data?.id ?? null;
}

async function updateSubscription(userId: string, subscription: Stripe.Subscription) {
  const admin = createSupabaseAdminClient();
  const status = subscription.status === "active" ? "active"
    : subscription.status === "past_due" ? "past_due"
    : subscription.status === "canceled" ? "canceled"
    : "trial";

  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
    ?? subscription.items?.data?.[0]?.current_period_end;
  const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

  await admin.from("profiles").update({
    stripe_subscription_id: subscription.id,
    subscription_status: status,
    subscription_expires_at: expiresAt,
  }).eq("id", userId);
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      const userId = session.metadata?.supabase_user_id;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await updateSubscription(userId, subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = await getSupabaseUserIdFromCustomer(subscription.customer as string);
      if (userId) await updateSubscription(userId, subscription);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = await getSupabaseUserIdFromCustomer(invoice.customer as string);
      if (userId) {
        await admin.from("profiles").update({ subscription_status: "past_due" }).eq("id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
