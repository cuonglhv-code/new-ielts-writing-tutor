import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import BandBadge from '@/components/ui/BandBadge'
import { formatDate, formatDateTime } from '@/lib/utils'
import StudentChart from '@/app/dashboard/StudentChart'
import { Submission } from '@/lib/types'

interface Props {
  params: { id: string }
}

export default async function TeacherStudentPage({ params }: Props) {
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
  if (profile.role !== 'teacher') redirect('/dashboard')

  // Student profile
  const { data: student, error: studentError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', params.id)
    .single()

  if (studentError || !student) notFound()

  // Student submissions
  const { data: submissionsData } = await supabase
    .from('submissions')
    .select('*, questions(task_type, topic, question_text)')
    .eq('student_id', params.id)
    .order('submitted_at', { ascending: false })

  const submissions: Submission[] = (submissionsData ?? []) as Submission[]
  const totalSubs = submissions.length
  const avgBand =
    totalSubs > 0
      ? submissions.reduce((sum, s) => sum + s.overall_band, 0) / totalSubs
      : 0

  // Criteria averages
  const criteriaAvg =
    totalSubs > 0
      ? {
          task_achievement: submissions.reduce((sum, s) => sum + (s.band_scores?.task_achievement ?? 0), 0) / totalSubs,
          coherence_cohesion: submissions.reduce((sum, s) => sum + (s.band_scores?.coherence_cohesion ?? 0), 0) / totalSubs,
          lexical_resource: submissions.reduce((sum, s) => sum + (s.band_scores?.lexical_resource ?? 0), 0) / totalSubs,
          grammatical_range: submissions.reduce((sum, s) => sum + (s.band_scores?.grammatical_range ?? 0), 0) / totalSubs,
        }
      : null

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          ← Back to students
        </Link>

        {/* Student header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-bold text-xl">
                {student.full_name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                {student.age && <span>Age {student.age}</span>}
                {student.band_target && <span>Target: Band {student.band_target}</span>}
                {student.study_hours && <span>{student.study_hours}h/week</span>}
                {student.background && <span>{student.background}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Submissions" value={totalSubs.toString()} />
          <StatCard
            label="Avg overall"
            value={totalSubs > 0 ? avgBand.toFixed(1) : '—'}
          />
          <StatCard
            label="Target band"
            value={student.band_target?.toFixed(1) ?? '—'}
          />
          <StatCard
            label="Latest submission"
            value={submissions[0] ? formatDate(submissions[0].submitted_at) : '—'}
          />
        </div>

        {/* Criteria averages */}
        {criteriaAvg && (
          <div className="card p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Average band scores by criterion</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Task Achievement', val: criteriaAvg.task_achievement },
                { label: 'Coherence & Cohesion', val: criteriaAvg.coherence_cohesion },
                { label: 'Lexical Resource', val: criteriaAvg.lexical_resource },
                { label: 'Grammatical Range', val: criteriaAvg.grammatical_range },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{val.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress chart */}
        {totalSubs > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Band score progression</h2>
            <StudentChart submissions={submissions.slice().reverse()} />
          </div>
        )}

        {/* Submission history */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Submission history</h2>
          </div>

          {totalSubs === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              This student has not submitted any essays yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {submissions.map((s) => (
                <Link
                  key={s.id}
                  href={`/submission/${s.id}`}
                  className="flex items-start justify-between px-6 py-4 hover:bg-gray-50 transition-colors group gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge bg-indigo-100 text-indigo-700 text-xs">
                        {(s as any).questions?.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                      </span>
                      <span className="badge bg-gray-100 text-gray-600 text-xs">
                        {(s as any).questions?.topic}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate group-hover:text-indigo-600">
                      {(s as any).questions?.question_text?.slice(0, 80)}…
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(s.submitted_at)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <BandBadge score={s.overall_band} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
