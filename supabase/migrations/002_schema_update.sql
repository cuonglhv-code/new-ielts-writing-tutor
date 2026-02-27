-- ============================================================
-- Jaxtina IELTS v2 — Schema Update (Migration 002)
-- Run this in Supabase → SQL Editor
-- ============================================================

-- ──────────────────────────────────────
-- 1. QUESTIONS — add question_type + image_url
-- ──────────────────────────────────────
alter table public.questions
  add column if not exists question_type text,
  add column if not exists image_url     text;

-- Valid question type values (informational comment — Postgres allows any text)
-- Task 1 types: bar_chart | line_graph | pie_chart | table | process | map | mixed
-- Task 2 types: opinion | discussion | advantages_disadvantages | problem_solution | double_question | mixed

-- ──────────────────────────────────────
-- 2. SUBMISSIONS — add full assessment JSONB
-- ──────────────────────────────────────
alter table public.submissions
  add column if not exists assessment jsonb;

-- ──────────────────────────────────────
-- 3. TIPS — add source + filtering fields
-- ──────────────────────────────────────
alter table public.tips
  add column if not exists source_url   text,
  add column if not exists source_title text,
  add column if not exists task_filter  integer,  -- 1 = Task 1 only, 2 = Task 2 only, NULL = both
  add column if not exists topic_tag    text;      -- e.g. structure, vocabulary, grammar, coherence, task_achievement

-- ──────────────────────────────────────
-- 4. STORAGE — question-images bucket
--    (Create the bucket via Supabase Dashboard → Storage
--     or uncomment below if using service role)
-- ──────────────────────────────────────
-- insert into storage.buckets (id, name, public)
-- values ('question-images', 'question-images', true)
-- on conflict do nothing;

-- Storage policy: anyone authenticated can read question images
-- create policy "Authenticated users can view question images"
--   on storage.objects for select
--   to authenticated
--   using (bucket_id = 'question-images');

-- ──────────────────────────────────────
-- 5. INDEXES for new columns
-- ──────────────────────────────────────
create index if not exists idx_questions_type on public.questions(question_type);
create index if not exists idx_tips_task      on public.tips(task_filter);
create index if not exists idx_tips_topic     on public.tips(topic_tag);
