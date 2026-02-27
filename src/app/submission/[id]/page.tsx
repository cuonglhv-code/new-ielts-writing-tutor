import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import BandBadge, { BandScoreCard } from '@/components/ui/BandBadge'
import { formatDateTime, countWords } from '@/lib/utils'

interface Props {
  params: { id: string }
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

  // Students can only see their own; teachers can see all
  if (profile.role === 'student' && submission.student_id !== user.id) {
    redirect('/dashboard')
  }

  const { band_scores, feedback, overall_band } = submission
  const strengths: string[] = (submission as any).strengths ?? []
  const improvements: string[] = (submission as any).areas_for_improvement ?? []
  const examinerComment: string = (submission as any).examiner_comment ?? ''
  const question = (submission as any).questions

  const wordCount = countWords(submission.essay_text)

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href={profile.role === 'teacher' ? '/teacher' : '/dashboard'}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          ← Back to {profile.role === 'teacher' ? 'students' : 'dashboard'}
        </Link>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge bg-indigo-100 text-indigo-700">
                  {question?.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                </span>
                <span className="badge bg-gray-100 text-gray-600">{question?.topic}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{question?.question_text}</p>
              <p className="text-xs text-gray-400 mt-2">
                Submitted {formatDateTime(submission.submitted_at)} · {wordCount} words
              </p>
            </div>

            {/* Overall band */}
            <div className="flex-shrink-0 text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Overall Band</p>
              <div className="text-5xl font-bold text-indigo-600">{overall_band?.toFixed(1)}</div>
              <BandBadge score={overall_band} size="sm" showLabel className="mt-2" />
            </div>
          </div>
        </div>

        {/* Band scores breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <BandScoreCard label="Task Achievement" score={band_scores?.task_achievement} />
          <BandScoreCard label="Coherence & Cohesion" score={band_scores?.coherence_cohesion} />
          <BandScoreCard label="Lexical Resource" score={band_scores?.lexical_resource} />
          <BandScoreCard label="Grammatical Range" score={band_scores?.grammatical_range} />
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
              <h3 className="text-sm font-semibold text-emerald-800 mb-3">
                ✓ Strengths
              </h3>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-700 flex gap-2">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {improvements.length > 0 && (
            <div className="card p-5 bg-amber-50 border-amber-100">
              <h3 className="text-sm font-semibold text-amber-800 mb-3">
                ↗ Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 flex gap-2">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Detailed feedback per criterion */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Detailed Feedback</h2>
          <div className="space-y-5">
            {[
              { key: 'task_achievement', label: 'Task Achievement / Task Response', score: band_scores?.task_achievement },
              { key: 'coherence_cohesion', label: 'Coherence and Cohesion', score: band_scores?.coherence_cohesion },
              { key: 'lexical_resource', label: 'Lexical Resource', score: band_scores?.lexical_resource },
              { key: 'grammatical_range', label: 'Grammatical Range and Accuracy', score: band_scores?.grammatical_range },
            ].map(({ key, label, score }) => (
              <div key={key} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
                  <BandBadge score={score} size="sm" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feedback?.[key as keyof typeof feedback] ?? 'No feedback available.'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Essay */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Your Essay</h2>
          <p className="text-xs text-gray-400 mb-3">{wordCount} words</p>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border border-gray-100">
            {submission.essay_text}
          </div>
        </div>

        {/* Actions */}
        {profile.role === 'student' && (
          <div className="flex gap-3">
            <Link href="/practice" className="btn-primary">
              Practice again →
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View dashboard
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
