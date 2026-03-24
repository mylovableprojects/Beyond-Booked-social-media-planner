-- Field photo uploads: table, storage bucket, and RLS.
-- Admin access uses public.profiles.is_admin (boolean), consistent with the app;
-- set is_admin = true for users who should have full read access.

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

-- Workers insert only their own rows (worker_id must match the session user).
create policy "field_uploads_insert_own"
  on public.field_uploads
  for insert
  to authenticated
  with check (worker_id = auth.uid());

-- Workers read only their own rows.
create policy "field_uploads_select_own"
  on public.field_uploads
  for select
  to authenticated
  using (worker_id = auth.uid());

-- Admins can read all rows (public.profiles.is_admin; same notion as "role = admin" in the app).
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

-- Storage: public bucket so image URLs work without a signed URL.
insert into storage.buckets (id, name, public)
values ('field-photos', 'field-photos', true)
on conflict (id) do update
  set public = excluded.public;

-- Anyone can read objects in this bucket (public URLs).
create policy "field_photos_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'field-photos');

-- Authenticated users can upload only under a first path segment equal to their user id
-- (e.g. storage path "{user_id}/photo.jpg").
create policy "field_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'field-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

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

create policy "field_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'field-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );
