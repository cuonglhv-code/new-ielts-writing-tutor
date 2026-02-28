-- ============================================================
-- Jaxtina IELTS v2 — Schema Update (Migration 004)
-- Lesson Questions Structure
-- ============================================================

-- ──────────────────────────────────────
-- 1. LESSON_QUESTIONS (Join Table)
-- ──────────────────────────────────────
create table if not exists public.lesson_questions (
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  primary key (lesson_id, question_id)
);

-- ──────────────────────────────────────
-- 2. ROW LEVEL SECURITY
-- ──────────────────────────────────────
alter table public.lesson_questions  enable row level security;

create policy "Authenticated users can read lesson_questions"
  on public.lesson_questions for select to authenticated using (true);

-- ──────────────────────────────────────
-- 3. INDEXES
-- ──────────────────────────────────────
create index if not exists idx_lesson_questions_ids on public.lesson_questions(lesson_id, question_id);
