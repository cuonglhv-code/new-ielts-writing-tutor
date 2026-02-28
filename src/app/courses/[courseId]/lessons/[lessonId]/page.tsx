import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Lesson } from '@/lib/types'
import { completeLesson } from './actions'

type PageProps = {
  params: { courseId: string; lessonId: string }
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = createClient()
  const { courseId, lessonId } = params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, modules(course_id, title)')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return (
        <>
            <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Lesson not found.</p>
            </main>
        </>
    )
  }

  const { data: completion } = await supabase
    .from('lesson_completions')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .single()

  const isCompleted = !!completion

  return (
    <>
      <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/courses/${lesson.modules?.course_id}`} className="text-sm text-blue-600 hover:underline">&larr; Back to Course</Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">{lesson.title}</h1>
          <p className="text-gray-500 mt-2 text-lg capitalize">{lesson.lesson_type} Lesson</p>
        </div>

        <div className="prose lg:prose-xl">
          {lesson.lesson_type === 'video' && (
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${lesson.content}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          {lesson.lesson_type === 'reading' && (
            <div>{lesson.content}</div>
          )}
           {lesson.lesson_type === 'speaking' && (
            <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-4">Speaking Prompt</h3>
                <p>{lesson.content}</p>
            </div>
          )}
          {/* Add rendering for other lesson types here */}
        </div>
        
        <div className="mt-12">
            <form action={completeLesson}>
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <input type="hidden" name="course_id" value={courseId} />
                <button 
                    type="submit"
                    className={`w-full py-3 px-6 rounded-lg text-white font-semibold ${isCompleted ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                    disabled={isCompleted}
                >
                    {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
            </form>
        </div>

      </main>
    </>
  )
}
