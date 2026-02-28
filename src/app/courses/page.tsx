import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Course } from '@/lib/types'

export default async function CoursesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IELTS Courses</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Browse our available courses and start your IELTS preparation journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(courses as Course[] | null)?.map(course => (
            <Link key={course.id} href={`/courses/${course.id}`} className="card block hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-bold text-indigo-600">{course.title}</h2>
                <p className="text-gray-500 mt-2">{course.description}</p>
              </div>
            </Link>
          ))}
          {(courses?.length === 0) && (
            <p className="text-gray-500">No courses available at the moment. Please check back later.</p>
          )}
        </div>
      </main>
    </>
  )
}
