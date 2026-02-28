import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { createModule } from '../actions'
import { Course, Module } from '@/lib/types'

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
  
  if (!profile) redirect('/login')
  if (profile.role !== 'teacher') redirect('/dashboard')

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course) {
    return (
        <>
            <Navbar role={profile.role} fullName={profile.full_name || ''} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Course not found.</p>
            </main>
        </>
    )
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('module_order', { ascending: true })

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-500 mt-2 text-lg">
                {course.description}
            </p>
        </div>

        {/* Module list will go here */}
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {(modules as Module[] | null)?.map(module => (
                        <li key={module.id}>
                            <a href={`/teacher/courses/${course.id}/modules/${module.id}`} className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-md font-medium text-indigo-600">{module.title}</p>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                            </a>
                        </li>
                    ))}
                    {(modules?.length === 0) && (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No modules created yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
        
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Add New Module</h2>
          <form action={createModule} className="mt-4 bg-white p-8 rounded-lg shadow-sm space-y-6">
            <input type="hidden" name="course_id" value={course.id} />
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Module Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="block w-full shadow-sm sm:text-sm rounded-md"
                  placeholder="e.g., Analyzing Line Graphs"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Module Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full shadow-sm sm:text-sm rounded-md"
                  placeholder="A brief summary of what this module covers."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
              >
                Add Module
              </button>
            </div>
          </form>
        </div>

      </main>
    </>
  )
}
