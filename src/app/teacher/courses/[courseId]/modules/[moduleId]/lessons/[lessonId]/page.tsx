import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Lesson, Question } from '@/lib/types'
import Link from 'next/link'

type PageProps = {
  params: { courseId: string; moduleId: string; lessonId: string }
}

export default async function LessonDetailPage({ params }: PageProps) {
  const supabase = createClient()
  const { courseId, moduleId, lessonId } = params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) redirect('/login')
  if (profile.role !== 'teacher') redirect('/dashboard')

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, modules(*, courses(title))')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return (
        <>
            <Navbar role={profile.role} fullName={profile.full_name || ''} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Lesson not found.</p>
            </main>
        </>
    )
  }

import { addQuestionToLesson, removeQuestionFromLesson } from './actions'

// ... imports and component definition

  const { data: lessonQuestions } = await supabase
    .from('lesson_questions')
    .select('*, questions(*)')
    .eq('lesson_id', lessonId)
  
  const { data: allQuestions } = await supabase
    .from('questions')
    .select('*')

  const associatedQuestionIds = lessonQuestions?.map(lq => lq.question_id) || []
  const availableQuestions = allQuestions?.filter(q => !associatedQuestionIds.includes(q.id)) || []

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <Link href={`/teacher/courses/${courseId}/modules/${moduleId}`} className="text-sm text-blue-600 hover:underline">&larr; Back to {lesson.modules?.title}</Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{lesson.title} <span className="px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-200 rounded-full">{lesson.lesson_type}</span></h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                 <h2 className="text-2xl font-bold text-gray-900">Lesson Content</h2>
                 <div className="mt-4 bg-white p-6 shadow rounded-md">
                    <pre className="whitespace-pre-wrap font-sans">{lesson.content}</pre>
                 </div>

                 <div className="mt-10">
                    <h2 className="text-2xl font-bold text-gray-900">Associated Questions</h2>
                    <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                           {lessonQuestions?.map(lq => (
                               <li key={lq.question_id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                   <div>
                                       <p className="font-medium">{lq.questions?.question_text}</p>
                                       <p className="text-sm text-gray-500">{lq.questions?.task_type} - {lq.questions?.topic}</p>
                                   </div>
                                   <form action={removeQuestionFromLesson}>
                                       <input type="hidden" name="lesson_id" value={lessonId} />
                                       <input type="hidden" name="question_id" value={lq.question_id} />
                                       <button type="submit" className="text-sm text-red-600 hover:text-red-800">Remove</button>
                                   </form>
                               </li>
                           ))}
                           {(lessonQuestions?.length === 0) && (
                                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                                    No questions associated with this lesson yet.
                                </li>
                           )}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="md:col-span-1">
                <h2 className="text-2xl font-bold text-gray-900">Add Questions</h2>
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200 h-96 overflow-y-auto">
                        {availableQuestions.map(q => (
                            <li key={q.id} className="px-4 py-3 sm:px-6 flex items-center justify-between">
                               <div>
                                    <p className="font-medium text-sm">{q.question_text}</p>
                                    <p className="text-xs text-gray-500">{q.task_type} - {q.topic}</p>
                               </div>
                               <form action={addQuestionToLesson}>
                                   <input type="hidden" name="lesson_id" value={lessonId} />
                                   <input type="hidden" name="question_id" value={q.id} />
                                   <button type="submit" className="text-sm text-blue-600 hover:text-blue-800">Add</button>
                               </form>
                            </li>
                        ))}
                         {(availableQuestions.length === 0) && (
                                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                                    No more questions to add.
                                </li>
                           )}
                    </ul>
                </div>
            </div>

        </div>
        
      </main>
    </>
  )
}
