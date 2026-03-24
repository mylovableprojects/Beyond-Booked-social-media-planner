-- Business owners vs field workers vs platform support (read-only admin UI).

alter table public.profiles
  add column if not exists account_role text not null default 'owner';

alter table public.profiles
  add column if not exists is_support_admin boolean not null default false;

alter table public.profiles
  add column if not exists employer_profile_id uuid references public.profiles (id) on delete cascade;

-- Normalize legacy rows
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

-- Workers cannot change their own role or employer via RLS updates (defense in depth).
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

-- Field uploads: business owner reads captures from their crew.
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
