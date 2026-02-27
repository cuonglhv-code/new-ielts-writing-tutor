import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
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

  if (!profile || !profile.full_name) {
    redirect('/onboarding')
  }

  if (profile.role === 'teacher') {
    redirect('/teacher')
  }

  redirect('/dashboard')
}
