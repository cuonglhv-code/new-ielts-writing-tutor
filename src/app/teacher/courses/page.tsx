import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Course } from '@/lib/types'

export default async function CoursesPage() {
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

  if (!profile) redirect('/login') // Should not happen if user exists
  if (profile.role !== 'teacher') redirect('/dashboard')

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-500 mt-1">
              Create, edit, and organize your IELTS courses and modules.
            </p>
          </div>
          <div>
            <a 
              href="/teacher/courses/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
            >
              + Create New Course
            </a>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {(courses as Course[] | null)?.map((course) => (
              <li key={course.id}>
                <a href={`/teacher/courses/${course.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-indigo-600 truncate">{course.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Published
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {course.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                         <p>Created: {new Date(course.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
             {(courses?.length === 0) && (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No courses found. Get started by creating a new one.
                </li>
            )}
          </ul>
        </div>
      </main>
    </>
  )
}
