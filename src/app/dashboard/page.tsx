import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import BandBadge from '@/components/ui/BandBadge'
import Navbar from '@/components/layout/Navbar'
import StudentChart from './StudentChart'
import { Submission, Course, Lesson, LessonCompletion, Module } from '@/lib/types'
import CourseProgress from './CourseProgress'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || !profile.full_name) redirect('/onboarding')
  if (profile.role !== 'student') redirect('/teacher')

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, questions(task_type, topic, question_text)')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(50)

  const { data: coursesData } = await supabase.from('courses').select('*')
  const { data: lessonCompletionsData } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user.id)
  const { data: lessonsData } = await supabase.from('lessons').select('id, module_id')
  const { data: modulesData } = await supabase.from('modules').select('id, course_id')

  const allSubs: Submission[] = (submissions ?? []) as Submission[]
  
  const courses: Course[] = (coursesData ?? []) as Course[]
  const lessonCompletions: LessonCompletion[] = (lessonCompletionsData ?? []) as LessonCompletion[]
  const lessons: Lesson[] = (lessonsData ?? []) as any[]
  const modules: Module[] = (modulesData ?? []) as Module[]

  const completedLessonIds = new Set(lessonCompletions.map(lc => lc.lesson_id))

  const courseProgress = courses.map(course => {
    const courseModules = modules.filter(m => m.course_id === course.id)
    const courseModuleIds = courseModules.map(m => m.id)
    const courseLessons = lessons.filter(l => courseModuleIds.includes(l.module_id))
    const completedLessonsInCourse = courseLessons.filter(l => completedLessonIds.has(l.id))
    const progress = courseLessons.length > 0 ? (completedLessonsInCourse.length / courseLessons.length) * 100 : 0
    return {
      ...course,
      progress,
      totalLessons: courseLessons.length,
      completedLessons: completedLessonsInCourse.length
    }
  })

  const totalSubs = allSubs.length
  const avgBand =
    totalSubs > 0
      ? allSubs.reduce((sum, s) => sum + s.overall_band, 0) / totalSubs
      : 0

  // Streak: consecutive days with at least one submission
  const uniqueDays = [
    ...new Set(allSubs.map((s) => s.submitted_at.slice(0, 10))),
  ].sort((a, b) => (a > b ? -1 : 1))

  let streak = 0
  const today = new Date().toISOString().slice(0, 10)
  let cursor = today

  for (const day of uniqueDays) {
    if (day === cursor) {
      streak++
      const d = new Date(cursor)
      d.setDate(d.getDate() - 1)
      cursor = d.toISOString().slice(0, 10)
    } else {
      break
    }
  }

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile.full_name.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-1">
            Track your progress and keep practising to reach Band {profile.band_target}.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total submissions"
            value={totalSubs.toString()}
            sub="essays submitted"
            colour="indigo"
          />
          <StatCard
            label="Average band"
            value={totalSubs > 0 ? avgBand.toFixed(1) : '—'}
            sub="overall band score"
            colour={avgBand >= 6.5 ? 'emerald' : avgBand >= 5 ? 'amber' : 'red'}
          />
          <StatCard
            label="Target band"
            value={profile.band_target?.toFixed(1) ?? '—'}
            sub="your goal"
            colour="indigo"
          />
          <StatCard
            label="Day streak"
            value={streak.toString()}
            sub={streak === 1 ? 'day in a row' : 'days in a row'}
            colour="indigo"
          />
        </div>

        <div className="my-8">
          <CourseProgress courses={courseProgress} />
        </div>

        {/* Chart + recent submissions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress chart */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Band score progress</h2>
            {totalSubs === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <p className="text-sm">No submissions yet.</p>
                <Link href="/practice" className="btn-primary mt-4 text-xs">
                  Start practising →
                </Link>
              </div>
            ) : (
              <StudentChart submissions={allSubs.slice().reverse()} />
            )}
          </div>

          {/* Recent submissions */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Recent submissions</h2>
            {totalSubs === 0 ? (
              <p className="text-sm text-gray-500">No submissions yet.</p>
            ) : (
              <ul className="space-y-3">
                {allSubs.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/submission/${s.id}`}
                      className="block group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {(s as any).questions?.question_text?.slice(0, 55)}…
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(s.submitted_at)}
                          </p>
                        </div>
                        <BandBadge score={s.overall_band} size="sm" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {totalSubs > 0 && (
              <Link href="/practice" className="btn-primary w-full mt-4 text-xs">
                Practice again →
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

function StatCard({
  label,
  value,
  sub,
  colour,
}: {
  label: string
  value: string
  sub: string
  colour: string
}) {
  const colourMap: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
  }
  const textMap: Record<string, string> = {
    indigo: 'text-indigo-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  }

  return (
    <div className={`card p-4 border ${colourMap[colour] ?? colourMap.indigo}`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${textMap[colour] ?? textMap.indigo}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}
