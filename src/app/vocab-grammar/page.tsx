import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'

export default async function VocabGrammarPage() {
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

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card p-2 sm:p-3">
          <iframe
            src="/ielts-vocab-grammar-bands.html"
            title="IELTS Vocabulary and Grammar by Band"
            className="w-full min-h-[calc(100vh-170px)] rounded-lg border border-gray-200"
          />
        </div>
      </main>
    </>
  )
}

