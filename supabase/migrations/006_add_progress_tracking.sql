-- ============================================================
-- Jaxtina IELTS v2 — Schema Update (Migration 006)
-- Student Progress Tracking and Speaking Lessons
-- ============================================================

-- ──────────────────────────────────────
-- 1. UPDATE LESSON TYPES
-- ──────────────────────────────────────
-- Remove the old constraint
alter table public.lessons drop constraint if exists lessons_lesson_type_check;

-- Add the new constraint with 'speaking'
alter table public.lessons add constraint lessons_lesson_type_check
  check (lesson_type in ('video', 'reading', 'quiz', 'listening', 'speaking'));

-- ──────────────────────────────────────
-- 2. LESSON COMPLETIONS
-- ──────────────────────────────────────
create table if not exists public.lesson_completions (
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ──────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ──────────────────────────────────────
alter table public.lesson_completions enable row level security;

create policy "Users can read their own lesson completions"
  on public.lesson_completions for select
  to authenticated
  using ( auth.uid() = user_id );

create policy "Users can insert their own lesson completions"
  on public.lesson_completions for insert
  to authenticated
  with check ( auth.uid() = user_id );
  
-- ──────────────────────────────────────
-- 4. INDEXES
-- ──────────────────────────────────────
create index if not exists idx_lesson_completions_user_id on public.lesson_completions(user_id);
create index if not exists idx_lesson_completions_lesson_id on public.lesson_completions(lesson_id);
