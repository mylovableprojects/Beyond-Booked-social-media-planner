create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  city text not null,
  state_region text,
  timezone text not null default 'America/Chicago',
  brand_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_event_types (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists profile_event_types_unique_name
  on public.profile_event_types (profile_id, lower(name));

create table if not exists public.profile_service_categories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists profile_service_categories_unique_name
  on public.profile_service_categories (profile_id, lower(name));

create table if not exists public.generation_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null check (year >= 2025),
  post_count int not null check (post_count between 1 and 50),
  promo_text text,
  featured_product text,
  status text not null check (status in ('queued', 'running', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.generation_selections (
  id uuid primary key default gen_random_uuid(),
  generation_run_id uuid not null references public.generation_runs(id) on delete cascade,
  platforms text[] not null,
  event_types text[] not null,
  service_categories text[] not null
);

create table if not exists public.generated_posts (
  id uuid primary key default gen_random_uuid(),
  generation_run_id uuid not null references public.generation_runs(id) on delete cascade,
  platform text not null check (platform in ('facebook', 'instagram', 'google_business_profile')),
  framework_used text not null check (framework_used in ('beyond-bookings', 'social-content', 'story-brand', 'seasonal-holiday')),
  cta_used text not null,
  post_index int not null check (post_index >= 0),
  content text not null,
  image_suggestion text not null,
  validation_report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profile_event_types enable row level security;
alter table public.profile_service_categories enable row level security;
alter table public.generation_runs enable row level security;
alter table public.generation_selections enable row level security;
alter table public.generated_posts enable row level security;

create policy "profiles_owner_all" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "event_types_owner_all" on public.profile_event_types
for all using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
)
with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
);

create policy "service_categories_owner_all" on public.profile_service_categories
for all using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
)
with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
);

create policy "generation_runs_owner_all" on public.generation_runs
for all using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
)
with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
);

create policy "generation_selections_owner_all" on public.generation_selections
for all using (
  exists (
    select 1
    from public.generation_runs gr
    join public.profiles p on p.id = gr.profile_id
    where gr.id = generation_run_id and p.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.generation_runs gr
    join public.profiles p on p.id = gr.profile_id
    where gr.id = generation_run_id and p.id = auth.uid()
  )
);

create policy "generated_posts_owner_all" on public.generated_posts
for all using (
  exists (
    select 1
    from public.generation_runs gr
    join public.profiles p on p.id = gr.profile_id
    where gr.id = generation_run_id and p.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.generation_runs gr
    join public.profiles p on p.id = gr.profile_id
    where gr.id = generation_run_id and p.id = auth.uid()
  )
);
