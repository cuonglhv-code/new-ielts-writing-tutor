import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import QuestionBrowser from './QuestionBrowser'
import { Question } from '@/lib/types'

export default async function PracticePage() {
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

  if (!profile?.full_name) redirect('/onboarding')
  if (profile.role !== 'student') redirect('/teacher')

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500 mt-1">
            Select a question to start a timed writing session. Your essay will be assessed by our AI examiner.
          </p>
        </div>
        <QuestionBrowser questions={(questions ?? []) as Question[]} />
      </main>
    </>
  )
}
