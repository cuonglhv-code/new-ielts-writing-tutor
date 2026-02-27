import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import TipsClient from './TipsClient'
import type { Tip } from '@/lib/types'

const CATEGORY_ICONS: Record<string, string> = {
  'Task 1 Structure':            '\u{1F4CA}',
  'Task 2 Argument Development': '\u270D\uFE0F',
  'Vocabulary':                  '\u{1F4DA}',
  'Grammar':                     '\u{1F524}',
  'Time Management':             '\u23F1\uFE0F',
}

const CATEGORY_ORDER = [
  'Task 1 Structure',
  'Task 2 Argument Development',
  'Vocabulary',
  'Grammar',
  'Time Management',
]

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

  const { data: tips } = await supabase
    .from('tips')
    .select('*')
    .order('created_at', { ascending: true })

  const tipList: Tip[] = (tips ?? []) as Tip[]

  // Build category list for the anchor nav
  const seen = new Set<string>()
  const categories: string[] = []
  for (const c of CATEGORY_ORDER) {
    if (tipList.some((t) => t.category === c)) { seen.add(c); categories.push(c) }
  }
  for (const tip of tipList) {
    if (!seen.has(tip.category)) { seen.add(tip.category); categories.push(tip.category) }
  }

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">IELTS Writing Tips</h1>
          <p className="text-gray-500 mt-1">
            Expert guidance on structure, argument, vocabulary, grammar, and time management.
          </p>
        </div>

        {/* Category nav */}
        <nav className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${cat.replace(/\s+/g, '-').toLowerCase()}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-300 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              {CATEGORY_ICONS[cat] ?? '\u{1F4CC}'} {cat}
            </a>
          ))}
        </nav>

        {/* Client component handles filtering + rendering */}
        <TipsClient tips={tipList} />
      </main>
    </>
  )
}
