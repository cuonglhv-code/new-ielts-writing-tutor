import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Course, Module, Lesson, LessonCompletion } from '@/lib/types'

type PageProps = {
  params: { courseId: string }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const supabase = createClient()
  const { courseId } = params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course) {
    return (
        <>
            <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Course not found.</p>
            </main>
        </>
    )
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', courseId)
    .order('module_order', { ascending: true })
    .order('lesson_order', { foreignTable: 'lessons', ascending: true })

  const { data: lessonCompletionsData } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user.id)

  const completedLessonIds = new Set(lessonCompletionsData?.map(lc => lc.lesson_id) ?? [])

  return (
    <>
      <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <Link href="/courses" className="text-sm text-blue-600 hover:underline">&larr; Back to Courses</Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{course.title}</h1>
            <p className="text-gray-500 mt-2 text-lg">
                {course.description}
            </p>
        </div>

        <div className="space-y-8">
            {(modules as (Module & { lessons: Lesson[] })[] | null)?.map(module => (
                <div key={module.id} className="card p-6">
                    <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
                    <p className="text-gray-500 mt-1">{module.description}</p>
                    <ul className="mt-6 space-y-4">
                        {module.lessons.map(lesson => (
                            <li key={lesson.id}>
                                <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="block p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${completedLessonIds.has(lesson.id) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <p className="font-medium">{lesson.title}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 capitalize">{lesson.lesson_type}</span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

      </main>
    </>
  )
}
