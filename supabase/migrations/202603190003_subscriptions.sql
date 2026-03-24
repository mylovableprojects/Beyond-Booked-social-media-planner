alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text not null default 'trial',
  add column if not exists subscription_expires_at timestamptz;

-- subscription_status values: 'trial' | 'active' | 'canceled' | 'past_due'
