import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import BandBadge, { BandScoreCard } from '@/components/ui/BandBadge'
import { formatDateTime, countWords } from '@/lib/utils'
import type { Assessment, CriterionDetail } from '@/lib/types'

interface Props {
  params: { id: string }
}

const CRITERIA = [
  { key: 'task_achievement',   label: 'Task Achievement / Task Response' },
  { key: 'coherence_cohesion', label: 'Coherence and Cohesion' },
  { key: 'lexical_resource',   label: 'Lexical Resource' },
  { key: 'grammatical_range',  label: 'Grammatical Range and Accuracy' },
] as const

function CriterionCard({
  label,
  detail,
  feedback,
}: {
  label: string
  detail?: CriterionDetail
  feedback?: string
}) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
        {detail && <BandBadge score={detail.band} size="sm" />}
      </div>
      {feedback && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{feedback}</p>
      )}
      {detail && (
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {detail.strengths.length > 0 && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1.5">What you did well</p>
              <ul className="space-y-1">
                {detail.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-emerald-700 flex gap-1.5">
                    <span className="flex-shrink-0">\u2022</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {detail.improvements.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1.5">To improve</p>
              <ul className="space-y-1">
                {detail.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                    <span className="flex-shrink-0">\u2197</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const QUESTION_TYPE_LABEL: Record<string, string> = {
  bar_chart: 'Bar chart', line_graph: 'Line graph', pie_chart: 'Pie chart',
  table: 'Table', process: 'Process diagram', map: 'Map',
  opinion: 'Opinion essay', discussion: 'Discussion essay',
  advantages_disadvantages: 'Advantages & Disadvantages',
  problem_solution: 'Problem & Solution', double_question: 'Double question',
  mixed: 'Mixed',
}

export default async function SubmissionPage({ params }: Props) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  if (!profile?.full_name) redirect('/onboarding')

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*, questions(*)')
    .eq('id', params.id)
    .single()

  if (error || !submission) notFound()

  if (profile.role === 'student' && submission.student_id !== user.id) {
    redirect('/dashboard')
  }

  const { band_scores, feedback, overall_band } = submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = submission as any
  const assessment: Assessment | null = sub.assessment ?? null

  const strengths: string[]    = assessment?.strengths            ?? sub.strengths            ?? []
  const improvements: string[] = assessment?.areas_for_improvement ?? sub.areas_for_improvement ?? []
  const examinerComment        = assessment?.examiner_comment      ?? sub.examiner_comment      ?? ''
  const nextSteps: string[]    = assessment?.next_steps            ?? []
  const modelImprovements      = assessment?.model_improvements    ?? null
  const criteriaDetail         = assessment?.criteria_detail       ?? null
  const question               = sub.questions

  const wordCount = countWords(submission.essay_text)

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={profile.role === 'teacher' ? '/teacher' : '/dashboard'}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          \u2190 Back to {profile.role === 'teacher' ? 'students' : 'dashboard'}
        </Link>

        {/* Header card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge bg-indigo-100 text-indigo-700">
                  {question?.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                </span>
                {question?.question_type && (
                  <span className="badge bg-violet-100 text-violet-700">
                    {QUESTION_TYPE_LABEL[question.question_type] ?? question.question_type}
                  </span>
                )}
                <span className="badge bg-gray-100 text-gray-600">{question?.topic}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{question?.question_text}</p>
              <p className="text-xs text-gray-400 mt-2">
                Submitted {formatDateTime(submission.submitted_at)} \u00b7 {wordCount} words
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Overall Band</p>
              <div className="text-5xl font-bold text-indigo-600">{overall_band?.toFixed(1)}</div>
              <BandBadge score={overall_band} size="sm" showLabel className="mt-2" />
            </div>
          </div>
        </div>

        {/* Band score grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <BandScoreCard label="Task Achievement"    score={band_scores?.task_achievement} />
          <BandScoreCard label="Coherence & Cohesion" score={band_scores?.coherence_cohesion} />
          <BandScoreCard label="Lexical Resource"    score={band_scores?.lexical_resource} />
          <BandScoreCard label="Grammatical Range"   score={band_scores?.grammatical_range} />
        </div>

        {/* Examiner comment */}
        {examinerComment && (
          <div className="card p-6 mb-6 bg-indigo-50 border-indigo-100">
            <h2 className="text-sm font-semibold text-indigo-900 mb-2">Examiner&apos;s Comment</h2>
            <p className="text-sm text-indigo-800 leading-relaxed">{examinerComment}</p>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {strengths.length > 0 && (
            <div className="card p-5 bg-emerald-50 border-emerald-100">
              <h3 className="text-sm font-semibold text-emerald-800 mb-3">\u2713 Overall Strengths</h3>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-700 flex gap-2">
                    <span className="flex-shrink-0 mt-0.5">\u2022</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {improvements.length > 0 && (
            <div className="card p-5 bg-amber-50 border-amber-100">
              <h3 className="text-sm font-semibold text-amber-800 mb-3">\u2197 Priority Improvements</h3>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 flex gap-2">
                    <span className="flex-shrink-0 mt-0.5">\u2022</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Next steps */}
        {nextSteps.length > 0 && (
          <div className="card p-6 mb-6 bg-sky-50 border-sky-100">
            <h2 className="text-sm font-semibold text-sky-900 mb-3">
              \U0001f3af Your Next Steps
            </h2>
            <ol className="space-y-2">
              {nextSteps.map((step, i) => (
                <li key={i} className="text-sm text-sky-800 flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-sky-600">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Detailed per-criterion feedback */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Detailed Feedback</h2>
          <div className="space-y-6">
            {CRITERIA.map(({ key, label }) => (
              <CriterionCard
                key={key}
                label={label}
                detail={criteriaDetail?.[key]}
                feedback={feedback?.[key as keyof typeof feedback]}
              />
            ))}
          </div>
        </div>

        {/* Model improvements */}
        {modelImprovements &&
          (modelImprovements.revised_intro ||
            (modelImprovements.revised_sentence_examples?.length ?? 0) > 0) && (
          <div className="card p-6 mb-6 border-violet-100 bg-violet-50">
            <h2 className="text-base font-semibold text-violet-900 mb-2">
              \u270f\ufe0f Model Improvements
            </h2>
            <p className="text-xs text-violet-600 mb-4">
              These illustrative suggestions are based on your own essay — not a full model answer.
            </p>
            {modelImprovements.revised_intro && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-violet-700 mb-2">Revised Introduction</p>
                <div className="bg-white rounded-lg border border-violet-200 p-4 text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{modelImprovements.revised_intro}&rdquo;
                </div>
              </div>
            )}
            {(modelImprovements.revised_sentence_examples?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-violet-700 mb-2">Improved Sentence Examples</p>
                <ul className="space-y-2">
                  {modelImprovements.revised_sentence_examples!.map((ex, i) => (
                    <li key={i} className="bg-white rounded-lg border border-violet-200 p-3 text-sm text-gray-700 italic">
                      &ldquo;{ex}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Task 1 image */}
        {question?.image_url && question?.task_type === 'task1' && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Task 1 Visual</h2>
            <Image
              src={question.image_url}
              alt="Task 1 chart or diagram"
              width={800}
              height={500}
              className="rounded-lg border border-gray-200 w-full h-auto"
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Essay */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Your Essay</h2>
          <p className="text-xs text-gray-400 mb-3">{wordCount} words</p>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border border-gray-100">
            {submission.essay_text}
          </div>
        </div>

        {profile.role === 'student' && (
          <div className="flex gap-3">
            <Link href="/practice" className="btn-primary">Practice again \u2192</Link>
            <Link href="/dashboard" className="btn-secondary">View dashboard</Link>
          </div>
        )}
      </main>
    </>
  )
}
