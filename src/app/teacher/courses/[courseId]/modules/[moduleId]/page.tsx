import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Module, Lesson } from '@/lib/types'
import Link from 'next/link'
import { createLesson } from './actions'

type PageProps = {
  params: { courseId: string; moduleId: string }
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const supabase = createClient()
  const { courseId, moduleId } = params

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

  const { data: module } = await supabase
    .from('modules')
    .select('*, courses(title)')
    .eq('id', moduleId)
    .single()

  if (!module) {
    return (
        <>
            <Navbar role={profile.role} fullName={profile.full_name || ''} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Module not found.</p>
            </main>
        </>
    )
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('lesson_order', { ascending: true })

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <Link href={`/teacher/courses/${courseId}`} className="text-sm text-blue-600 hover:underline">&larr; Back to {module.courses?.title}</Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{module.title}</h1>
            <p className="text-gray-500 mt-2 text-lg">
                {module.description}
            </p>
        </div>

        <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">IELTS Lessons</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {(lessons as Lesson[] | null)?.map(lesson => (
                        <li key={lesson.id}>
                            <Link href={`/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`} className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-md font-medium text-indigo-600">{lesson.title}</p>
                                    <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">{lesson.lesson_type}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 truncate">{lesson.content}</p>
                            </Link>
                        </li>
                    ))}
                    {(lessons?.length === 0) && (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No lessons created yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
        
        {/* Add lesson form will go here */}
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">Add New Lesson</h2>
            <form action={createLesson} className="mt-4 bg-white p-8 rounded-lg shadow-sm space-y-6">
                <input type="hidden" name="course_id" value={courseId} />
                <input type="hidden" name="module_id" value={moduleId} />
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Lesson Title</label>
                    <input type="text" name="title" id="title" className="mt-1 block w-full shadow-sm sm:text-sm rounded-md" required />
                </div>
                <div>
                    <label htmlFor="lesson_type" className="block text-sm font-medium text-gray-700">Lesson Type</label>
                    <select name="lesson_type" id="lesson_type" className="mt-1 block w-full shadow-sm sm:text-sm rounded-md" required>
                        <option value="reading">Reading</option>
                        <option value="video">Video</option>
                        <option value="quiz">Quiz</option>
                        <option value="listening">Listening</option>
                        <option value="speaking">Speaking</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea name="content" id="content" rows={10} className="mt-1 block w-full shadow-sm sm:text-sm rounded-md" placeholder="For Reading, paste the article. For Video, paste the URL. For Speaking, provide the prompt."></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Add Lesson</button>
                </div>
            </form>
        </div>
        
      </main>
    </>
  )
}
