-- ============================================================
-- Jaxtina IELTS v2 — Database Schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- ──────────────────────────────────────
-- 1. PROFILES
-- ──────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  role        text not null check (role in ('student', 'teacher')) default 'student',
  full_name   text,
  age         integer,
  band_target numeric(3,1),
  study_hours integer,
  background  text,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────
-- 2. QUESTIONS
-- ──────────────────────────────────────
create table if not exists public.questions (
  id            uuid primary key default gen_random_uuid(),
  task_type     text not null check (task_type in ('task1', 'task2')),
  topic         text not null,
  difficulty    text not null check (difficulty in ('Band 5-6', 'Band 6-7', 'Band 7-8')),
  question_text text not null,
  created_at    timestamptz not null default now()
);

-- ──────────────────────────────────────
-- 3. SUBMISSIONS
-- ──────────────────────────────────────
create table if not exists public.submissions (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references auth.users(id) on delete cascade,
  question_id           uuid not null references public.questions(id) on delete set null,
  essay_text            text not null,
  band_scores           jsonb,
  feedback              jsonb,
  overall_band          numeric(3,1),
  strengths             jsonb,
  areas_for_improvement jsonb,
  examiner_comment      text,
  submitted_at          timestamptz not null default now()
);

-- ──────────────────────────────────────
-- 4. TIPS
-- ──────────────────────────────────────
create table if not exists public.tips (
  id         uuid primary key default gen_random_uuid(),
  category   text not null,
  title      text not null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ──────────────────────────────────────
-- 5. TRIGGER: auto-create profile on signup
-- ──────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ──────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.tips      enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Teachers can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'teacher'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- QUESTIONS policies
create policy "Authenticated users can read questions"
  on public.questions for select
  to authenticated
  using (true);

-- SUBMISSIONS policies
create policy "Students can insert own submissions"
  on public.submissions for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Students can read own submissions, teachers read all"
  on public.submissions for select
  to authenticated
  using (
    auth.uid() = student_id
    or exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'teacher'
    )
  );

-- TIPS policies
create policy "Authenticated users can read tips"
  on public.tips for select
  to authenticated
  using (true);

-- ──────────────────────────────────────
-- 7. INDEXES
-- ──────────────────────────────────────
create index if not exists idx_profiles_user_id    on public.profiles(user_id);
create index if not exists idx_submissions_student on public.submissions(student_id);
create index if not exists idx_submissions_question on public.submissions(question_id);
create index if not exists idx_submissions_date    on public.submissions(submitted_at desc);
create index if not exists idx_questions_task_type on public.questions(task_type);
create index if not exists idx_tips_category       on public.tips(category);
