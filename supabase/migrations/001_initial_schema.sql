-- DAYMARK: Initial Supabase Schema & Row Level Security
-- Run this migration in your Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1. User Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null default 'Creator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Time Entries
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 1440),
  category text not null check (category in ('Agency', 'Music', 'Personal', 'Break', 'Learning', 'Other')),
  activity_name text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_time_entries_user_date
  on public.time_entries (user_id, date desc);

alter table public.time_entries enable row level security;

create policy "Users can view own time entries"
  on public.time_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own time entries"
  on public.time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own time entries"
  on public.time_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own time entries"
  on public.time_entries for delete
  using (auth.uid() = user_id);

-- 3. Daily Reviews
create table if not exists public.daily_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  accomplished text not null default '',
  incomplete text not null default '',
  distractions text not null default '',
  learned text not null default '',
  improvements text not null default '',
  tomorrow_priority text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists idx_daily_reviews_user_date
  on public.daily_reviews (user_id, date desc);

alter table public.daily_reviews enable row level security;

create policy "Users can view own daily reviews"
  on public.daily_reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily reviews"
  on public.daily_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily reviews"
  on public.daily_reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily reviews"
  on public.daily_reviews for delete
  using (auth.uid() = user_id);

-- 4. User Preferences
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Creator',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  agency_target_minutes integer not null default 300,
  music_target_minutes integer not null default 210,
  streak_threshold_percent integer not null default 80,
  daily_review_time text not null default '23:00',
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Creator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
