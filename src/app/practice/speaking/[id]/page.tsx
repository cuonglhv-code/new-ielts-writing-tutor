import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import AudioRecorder from './AudioRecorder'

type PageProps = {
  params: { id: string }
}

export default async function SpeakingPracticeIdPage({ params }: PageProps) {
  const supabase = createClient()
  const { id: questionId } = params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  // Hardcoded speaking question for now
  const speakingQuestion = {
    id: '1',
    question_text: 'Describe a time you were very busy. You should say: when it was, what you had to do, and explain how you managed your time.',
    topic: 'Time Management',
  }

  if (questionId !== speakingQuestion.id) {
    return (
        <>
            <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Question not found.</p>
            </main>
        </>
    )
  }

  return (
    <>
      <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
            <h1 className="text-2xl font-bold text-gray-900">{speakingQuestion.topic}</h1>
            <p className="text-gray-600 mt-4 text-lg">{speakingQuestion.question_text}</p>
            
            <div className="mt-8">
                <AudioRecorder questionId={speakingQuestion.id} />
            </div>
        </div>
      </main>
    </>
  )
}
