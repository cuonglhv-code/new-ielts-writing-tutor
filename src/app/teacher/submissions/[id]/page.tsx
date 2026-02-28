import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Submission }from '@/lib/types'
import { saveAssessment } from './actions'

type PageProps = {
  params: { id: string }
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const supabase = createClient()
  const { id: submissionId } = params

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

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, questions(*), profiles(*)')
    .eq('id', submissionId)
    .single()

  if (!submission) {
    return (
        <>
            <Navbar role={profile.role} fullName={profile.full_name || ''} />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Submission not found.</p>
            </main>
        </>
    )
  }

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name || ''} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grade IELTS Submission</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Student: {submission.profiles.full_name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Question</h2>
                <p className="text-gray-600 mb-4">{submission.questions.question_text}</p>
                <h2 className="text-xl font-bold mb-4">Student's Essay</h2>
                <div className="prose lg:prose-lg max-w-none">{submission.essay_text}</div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Grading</h2>
                <form action={saveAssessment}>
                    <input type="hidden" name="submission_id" value={submission.id} />
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="task_achievement" className="block text-sm font-medium text-gray-700">Task Achievement</label>
                            <input type="number" step="0.5" min="0" max="9" name="task_achievement" id="task_achievement" className="mt-1 block w-full shadow-sm sm:text-sm rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="coherence_cohesion" className="block text-sm font-medium text-gray-700">Coherence & Cohesion</label>
                            <input type="number" step="0.5" min="0" max="9" name="coherence_cohesion" id="coherence_cohesion" className="mt-1 block w-full shadow-sm sm:text-sm rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="lexical_resource" className="block text-sm font-medium text-gray-700">Lexical Resource</label>
                            <input type="number" step="0.5" min="0" max="9" name="lexical_resource" id="lexical_resource" className="mt-1 block w-full shadow-sm sm:text-sm rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="grammatical_range" className="block text-sm font-medium text-gray-700">Grammatical Range & Accuracy</label>
                            <input type="number" step="0.5" min="0" max="9" name="grammatical_range" id="grammatical_range" className="mt-1 block w-full shadow-sm sm:text-sm rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Overall Feedback</label>
                            <textarea name="feedback" id="feedback" rows={5} className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"></textarea>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700">
                            Submit Grade
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
