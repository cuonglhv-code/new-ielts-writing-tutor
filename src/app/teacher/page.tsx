import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import BandBadge from '@/components/ui/BandBadge'
import { formatDate } from '@/lib/utils'
import TeacherAggregateChart from './TeacherAggregateChart'

export default async function TeacherDashboardPage() {
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

  // Fetch all student profiles
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  // Fetch all submissions
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('student_id, overall_band, band_scores, submitted_at')
    .order('submitted_at', { ascending: false })

  const submissions = allSubmissions ?? []

  // Per-student stats
  const studentStats = (students ?? []).map((s) => {
    const subs = submissions.filter((sub) => sub.student_id === s.user_id)
    const avg =
      subs.length > 0
        ? subs.reduce((sum: number, sub: any) => sum + (sub.overall_band ?? 0), 0) / subs.length
        : null
    const latest = subs[0]
    return { ...s, submissionCount: subs.length, avgBand: avg, latestDate: latest?.submitted_at }
  })

  // Aggregate: average per criterion across all submissions
  const subsWithScores = submissions.filter((s: any) => s.band_scores)
  const criteriaAvg =
    subsWithScores.length > 0
      ? {
          task_achievement:
            subsWithScores.reduce((sum: number, s: any) => sum + (s.band_scores?.task_achievement ?? 0), 0) /
            subsWithScores.length,
          coherence_cohesion:
            subsWithScores.reduce((sum: number, s: any) => sum + (s.band_scores?.coherence_cohesion ?? 0), 0) /
            subsWithScores.length,
          lexical_resource:
            subsWithScores.reduce((sum: number, s: any) => sum + (s.band_scores?.lexical_resource ?? 0), 0) /
            subsWithScores.length,
          grammatical_range:
            subsWithScores.reduce((sum: number, s: any) => sum + (s.band_scores?.grammatical_range ?? 0), 0) /
            subsWithScores.length,
        }
      : null

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {(students ?? []).length} registered student{(students ?? []).length !== 1 ? 's' : ''} ·{' '}
            {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Aggregate stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AggCard label="Total students" value={(students ?? []).length.toString()} />
          <AggCard label="Total submissions" value={submissions.length.toString()} />
          <AggCard
            label="Avg overall band"
            value={
              subsWithScores.length > 0
                ? (
                    subsWithScores.reduce((sum: number, s: any) => sum + (s.overall_band ?? 0), 0) /
                    subsWithScores.length
                  ).toFixed(1)
                : '—'
            }
          />
          <AggCard
            label="Active students"
            value={studentStats.filter((s) => s.submissionCount > 0).length.toString()}
            sub="have submitted at least once"
          />
        </div>

        {/* Aggregate criteria chart */}
        {criteriaAvg && (
          <div className="card p-6 mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Average Band Scores by Criterion (all students)
            </h2>
            <TeacherAggregateChart criteriaAvg={criteriaAvg} />
          </div>
        )}

        {/* Student list */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Students</h2>
          </div>

          {(students ?? []).length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No students have registered yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {studentStats.map((s) => (
                <Link
                  key={s.id}
                  href={`/teacher/student/${s.user_id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 font-semibold text-sm">
                        {s.full_name?.charAt(0).toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {s.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Target: Band {s.band_target ?? '—'} ·{' '}
                        {s.submissionCount} submission{s.submissionCount !== 1 ? 's' : ''}
                        {s.latestDate ? ` · Last: ${formatDate(s.latestDate)}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {s.avgBand !== null ? (
                      <BandBadge score={Math.round(s.avgBand * 2) / 2} size="sm" />
                    ) : (
                      <span className="text-xs text-gray-400">No submissions</span>
                    )}
                    <svg
                      className="h-4 w-4 text-gray-300 group-hover:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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

function AggCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-indigo-700 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
