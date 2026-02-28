-- ============================================================
-- Jaxtina IELTS v2 — Schema Update (Migration 005)
-- Add Listening Lesson Type
-- ============================================================

-- Remove the old constraint
alter table public.lessons drop constraint if exists lessons_lesson_type_check;

-- Add the new constraint with 'listening'
alter table public.lessons add constraint lessons_lesson_type_check
  check (lesson_type in ('video', 'reading', 'quiz', 'listening'));
