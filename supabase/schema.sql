-- Sloth: контент, який редагується з адмінки, прогрес користувачів, список адмінів

create table if not exists public.app_config (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists app_config_touch on public.app_config;
create trigger app_config_touch before update on public.app_config
  for each row execute function public.touch_updated_at();

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

alter table public.app_config enable row level security;
alter table public.admins enable row level security;
alter table public.progress enable row level security;

-- Контент бачать усі (застосунок), змінюють лише адміни
drop policy if exists "config read" on public.app_config;
create policy "config read" on public.app_config
  for select to anon, authenticated using (true);

drop policy if exists "config admin insert" on public.app_config;
create policy "config admin insert" on public.app_config
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "config admin update" on public.app_config;
create policy "config admin update" on public.app_config
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Адмін бачить лише свій запис (щоб адмінка знала, що він адмін)
drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Прогрес: кожен бачить і змінює лише свій
drop policy if exists "progress own" on public.progress;
create policy "progress own" on public.progress
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
