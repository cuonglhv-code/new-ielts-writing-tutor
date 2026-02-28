import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { createCourse } from './actions'

export default async function NewCoursePage() {
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
  
  if (!profile) redirect('/login')
  if (profile.role !== 'teacher') redirect('/dashboard')

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-500 mt-1">
            Fill in the details below to create a new course.
          </p>
        </div>

        <form action={createCourse} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-sm">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Course Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                className="block w-full shadow-sm sm:text-sm rounded-md"
                placeholder="e.g., IELTS Academic Writing Masterclass"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Course Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                className="block w-full shadow-sm sm:text-sm rounded-md"
                placeholder="A brief summary of what this course covers."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
             <a href="/teacher/courses" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300">
                Cancel
            </a>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700"
            >
              Save Course
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
