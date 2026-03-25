-- Beyond Booked: full schema in one script (all migrations, ordered).
-- Paste into Supabase → SQL Editor → Run once.
-- Safe to re-run in many cases (IF NOT EXISTS + DROP POLICY IF EXISTS before policies).

create extension if not exists "pgcrypto";

-- ========== 202603190001_initial_schema ==========

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

drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "event_types_owner_all" on public.profile_event_types;
create policy "event_types_owner_all" on public.profile_event_types
for all using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
)
with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
);

drop policy if exists "service_categories_owner_all" on public.profile_service_categories;
create policy "service_categories_owner_all" on public.profile_service_categories
for all using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
)
with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
);

drop policy if exists "generation_runs_owner_all" on public.generation_runs;
create policy "generation_runs_owner_all" on public.generation_runs
for all using (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
)
with check (
  exists (select 1 from public.profiles p where p.id = profile_id and p.id = auth.uid())
);

drop policy if exists "generation_selections_owner_all" on public.generation_selections;
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

drop policy if exists "generated_posts_owner_all" on public.generated_posts;
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

-- ========== 202603190002_trial_and_names ==========

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists trial_runs_used int not null default 0;

alter table public.profiles alter column city set default '';

-- ========== 202603190003_subscriptions ==========

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text not null default 'trial',
  add column if not exists subscription_expires_at timestamptz;

-- ========== 202603240001_field_uploads ==========

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create table if not exists public.field_uploads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  worker_name text not null,
  worker_id uuid not null references auth.users (id) on delete cascade,
  raw_notes text,
  generated_caption text,
  hashtags text,
  photo_url text not null,
  photo_path text not null,
  event_type text,
  source text not null default 'field_upload',
  status text not null default 'draft' check (status in ('draft', 'published'))
);

create index if not exists field_uploads_worker_id_idx
  on public.field_uploads (worker_id);

create index if not exists field_uploads_created_at_idx
  on public.field_uploads (created_at desc);

alter table public.field_uploads enable row level security;

drop policy if exists "field_uploads_insert_own" on public.field_uploads;
create policy "field_uploads_insert_own"
  on public.field_uploads
  for insert
  to authenticated
  with check (worker_id = auth.uid());

drop policy if exists "field_uploads_select_own" on public.field_uploads;
create policy "field_uploads_select_own"
  on public.field_uploads
  for select
  to authenticated
  using (worker_id = auth.uid());

drop policy if exists "field_uploads_select_admin" on public.field_uploads;
create policy "field_uploads_select_admin"
  on public.field_uploads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_admin is true
    )
  );

insert into storage.buckets (id, name, public)
values ('field-photos', 'field-photos', true)
on conflict (id) do update
  set public = excluded.public;

drop policy if exists "field_photos_public_read" on storage.objects;
create policy "field_photos_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'field-photos');

drop policy if exists "field_photos_insert_own" on storage.objects;
create policy "field_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'field-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "field_photos_update_own" on storage.objects;
create policy "field_photos_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'field-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'field-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "field_photos_delete_own" on storage.objects;
create policy "field_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'field-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- ========== 202603251200_fix_field_storage_rls ==========

drop policy if exists "field_photos_insert_own" on storage.objects;
drop policy if exists "field_photos_update_own" on storage.objects;
drop policy if exists "field_photos_delete_own" on storage.objects;

create policy "field_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  );

create policy "field_photos_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  )
  with check (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  );

create policy "field_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'field-photos'
    and name like auth.uid()::text || '/%'
  );

-- ========== 202603260001_account_roles_workers_support ==========

alter table public.profiles
  add column if not exists account_role text not null default 'owner';

alter table public.profiles
  add column if not exists is_support_admin boolean not null default false;

alter table public.profiles
  add column if not exists employer_profile_id uuid references public.profiles (id) on delete cascade;

update public.profiles
set account_role = 'owner', employer_profile_id = null
where account_role is null or account_role not in ('owner', 'worker');

alter table public.profiles
  drop constraint if exists profiles_account_role_check;

alter table public.profiles
  add constraint profiles_account_role_check
  check (account_role in ('owner', 'worker'));

alter table public.profiles
  drop constraint if exists profiles_worker_employer_consistency;

alter table public.profiles
  add constraint profiles_worker_employer_consistency check (
    (account_role = 'worker' and employer_profile_id is not null)
    or (account_role = 'owner' and employer_profile_id is null)
  );

create or replace function public.profiles_prevent_worker_escalation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.account_role = 'worker' then
    if new.account_role is distinct from old.account_role
       or new.employer_profile_id is distinct from old.employer_profile_id then
      raise exception 'Worker accounts cannot change role or employer';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_worker_escalation_trigger on public.profiles;

create trigger profiles_prevent_worker_escalation_trigger
  before update on public.profiles
  for each row
  execute function public.profiles_prevent_worker_escalation();

drop policy if exists "field_uploads_select_employer" on public.field_uploads;
create policy "field_uploads_select_employer"
  on public.field_uploads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles w
      where w.id = field_uploads.worker_id
        and w.account_role = 'worker'
        and w.employer_profile_id = auth.uid()
    )
  );

drop policy if exists "field_uploads_select_admin" on public.field_uploads;

drop policy if exists "field_uploads_select_platform_staff" on public.field_uploads;
create policy "field_uploads_select_platform_staff"
  on public.field_uploads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin is true or p.is_support_admin is true)
    )
  );
