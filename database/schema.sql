-- Python Course Platform V2 — Supabase Postgres schema
--
-- HOW TO USE:
--   1. Create a free project at https://supabase.com
--   2. Open the SQL Editor in your Supabase dashboard
--   3. Paste this entire file and run it once
--   4. Set the frontend/backend env vars from Project Settings > API
--
-- Auth (email/password, hashing, sessions, password reset emails) is
-- handled entirely by Supabase's built-in `auth.users` table — we never
-- store or touch passwords ourselves. Everything below is content and
-- access-control data that references auth.users by id.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- profiles: one row per student, mirrors auth.users
-- ─────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  is_disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- admins: allowlist of which users can reach the admin dashboard
-- ─────────────────────────────────────────────────────────────
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- course content
-- ─────────────────────────────────────────────────────────────
create table sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  order_index int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  title text not null,
  description text not null default '',
  duration text not null default '',
  video_url text not null default '',
  thumbnail_url text not null default '',
  resource_url text,          -- optional single link to a PDF/ZIP/etc (see README on file uploads)
  homework_url text,
  order_index int not null default 0,
  is_published boolean not null default true,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- access codes: each code unlocks exactly ONE lesson
-- ─────────────────────────────────────────────────────────────
create table access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'deactivated')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  note text,
  -- future-ready fields, unused by MVP logic today:
  max_uses int not null default 1,
  used_count int not null default 0,
  reusable boolean not null default false,
  assigned_student_id uuid references auth.users(id)
);

-- ─────────────────────────────────────────────────────────────
-- unlocked_lessons: which student unlocked which lesson, and until when
-- ─────────────────────────────────────────────────────────────
create table unlocked_lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (student_id, lesson_id)
);

-- ─────────────────────────────────────────────────────────────
-- course_settings: single-row table for landing page / branding content
-- ─────────────────────────────────────────────────────────────
create table course_settings (
  id int primary key default 1,
  course_title text not null default 'Python Basics',
  course_description text not null default 'Learn Python step by step through simple explanations and practical coding.',
  instructor_name text not null default '',
  instructor_bio text not null default '',
  instructor_photo_url text not null default '',
  banner_url text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  constraint single_row check (id = 1)
);
insert into course_settings (id) values (1);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table admins enable row level security;
alter table sessions enable row level security;
alter table lessons enable row level security;
alter table access_codes enable row level security;
alter table unlocked_lessons enable row level security;
alter table course_settings enable row level security;

-- profiles: a student can read/update only their own row
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- sessions/lessons: published content is readable by anyone (landing page
-- curriculum preview + dashboard need this); writes only happen via the
-- backend using the service role key, which ignores RLS entirely.
create policy "public read published sessions" on sessions for select using (is_published = true);
create policy "public read published lessons" on lessons for select using (is_published = true and is_hidden = false);

-- course_settings: publicly readable (landing page), no public writes
create policy "public read settings" on course_settings for select using (true);

-- access_codes: no public policies at all — only the backend's service
-- role key (which bypasses RLS) can ever read or write these.

-- unlocked_lessons: a student can see their own unlocks; inserts only
-- happen via the backend after a code is validated.
create policy "read own unlocks" on unlocked_lessons for select using (auth.uid() = student_id);

-- admins: no public policies — only the service role checks this table.
