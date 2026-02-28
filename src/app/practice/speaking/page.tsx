import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SpeakingPracticePage() {
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

  // Hardcoded speaking question for now
  const speakingQuestion = {
    id: '1',
    question_text: 'Describe a time you were very busy. You should say: when it was, what you had to do, and explain how you managed your time.',
    topic: 'Time Management',
  }

  return (
    <>
      <Navbar role={profile?.role} fullName={profile?.full_name || ''} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Speaking Practice</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Practice your speaking skills with these IELTS-style questions.
          </p>
        </div>

        <div className="card">
            <ul role="list" className="divide-y divide-gray-200">
                <li>
                    <Link href={`/practice/speaking/${speakingQuestion.id}`} className="block hover:bg-gray-50 p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-indigo-600">{speakingQuestion.topic}</p>
                        </div>
                        <p className="text-gray-500 mt-2">{speakingQuestion.question_text}</p>
                    </Link>
                </li>
            </ul>
        </div>
      </main>
    </>
  )
}
