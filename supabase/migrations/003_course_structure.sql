-- ============================================================
-- Jaxtina IELTS v2 — Schema Update (Migration 003)
-- Course and Module Structure
-- ============================================================

-- ──────────────────────────────────────
-- 1. COURSES
-- ──────────────────────────────────────
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────
-- 2. MODULES
-- ──────────────────────────────────────
create table if not exists public.modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text,
  module_order integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────
-- 3. LESSONS
-- ──────────────────────────────────────
create table if not exists public.lessons (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  lesson_type text not null check (lesson_type in ('video', 'reading', 'quiz')),
  content     text, -- For reading content or video URL
  lesson_order integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────
-- 4. MODULE_QUESTIONS (Join Table)
-- ──────────────────────────────────────
create table if not exists public.module_questions (
  module_id   uuid not null references public.modules(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  primary key (module_id, question_id)
);


-- ──────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ──────────────────────────────────────
alter table public.courses           enable row level security;
alter table public.modules           enable row level security;
alter table public.lessons           enable row level security;
alter table public.module_questions  enable row level security;

-- POLICIES
create policy "Authenticated users can read courses"
  on public.courses for select to authenticated using (true);

create policy "Authenticated users can read modules"
  on public.modules for select to authenticated using (true);

create policy "Authenticated users can read lessons"
  on public.lessons for select to authenticated using (true);

create policy "Authenticated users can read module_questions"
  on public.module_questions for select to authenticated using (true);

-- ──────────────────────────────────────
-- 6. INDEXES
-- ──────────────────────────────────────
create index if not exists idx_modules_course_id on public.modules(course_id);
create index if not exists idx_lessons_module_id on public.lessons(module_id);
create index if not exists idx_module_questions_ids on public.module_questions(module_id, question_id);
