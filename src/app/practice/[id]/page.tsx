import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import WritingInterface from './WritingInterface'

interface Props {
  params: { id: string }
}

export default async function PracticeQuestionPage({ params }: Props) {
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

  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !question) notFound()

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />
      <WritingInterface question={question} />
    </>
  )
}
