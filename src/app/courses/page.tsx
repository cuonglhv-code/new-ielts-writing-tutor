import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'

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

  return (
    <div className="flex flex-col h-screen">
      <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
      <main className="flex-1 w-full h-full">
        <iframe
          src="https://jaxtina.com/khoa-luyen-thi-ielts/"
          className="w-full h-full border-none"
          title="Jaxtina IELTS Courses"
        />
      </main>
    </div>
  )
}
