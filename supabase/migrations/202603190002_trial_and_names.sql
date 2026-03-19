-- Add first/last name and trial tracking to profiles
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists trial_runs_used int not null default 0;

-- Allow city to be empty string so we can create a partial profile at signup
-- (onboarding will fill it in properly)
alter table public.profiles alter column city set default '';
