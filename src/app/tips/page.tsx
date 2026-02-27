import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import TipsClient from './TipsClient'
import type { GuideData } from './types'

async function loadGuideData(): Promise<GuideData> {
  const guidePath = path.join(process.cwd(), 'IELTS-Writing-Guide.md')
  const markdown = await fs.readFile(guidePath, 'utf8')
  const match = markdown.match(/## JSON Data for the App\s+```json\s*([\s\S]*?)\s*```/)

  if (!match?.[1]) {
    throw new Error('JSON block not found in IELTS-Writing-Guide.md')
  }

  const parsed = JSON.parse(match[1]) as GuideData
  if (!parsed.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
    throw new Error('Invalid guide JSON data')
  }

  return parsed
}

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

  const guideData = await loadGuideData()

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <TipsClient data={guideData} />
      </main>
    </>
  )
}
