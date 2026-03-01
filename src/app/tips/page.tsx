import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import TipsClient from './TipsClient'

export default async function TipsPage() {
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

  // Load the new JSON KB
  const kbPath = path.join(process.cwd(), 'src', 'lib', 'ielts_acad_writing_kb_bilingual.json')
  const kbData = JSON.parse(await fs.readFile(kbPath, 'utf8'))

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <TipsClient data={kbData} />
      </main>
    </>
  )
}
