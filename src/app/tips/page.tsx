import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Tip } from '@/lib/types'

const CATEGORY_ICONS: Record<string, string> = {
  'Task 1 Structure': '📊',
  'Task 2 Argument Development': '✍️',
  'Vocabulary': '📚',
  'Grammar': '🔤',
  'Time Management': '⏱️',
}

const CATEGORY_ORDER = [
  'Task 1 Structure',
  'Task 2 Argument Development',
  'Vocabulary',
  'Grammar',
  'Time Management',
]

function renderMarkdown(text: string) {
  // Simple markdown-like rendering: bold **text** and bullet lists
  return text
    .split('\n')
    .map((line, i) => {
      const boldLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      if (line.startsWith('☑')) {
        return `<li class="flex gap-2 items-start"><span class="text-emerald-500 flex-shrink-0">☑</span><span>${boldLine.slice(1).trim()}</span></li>`
      }
      if (line.startsWith('•') || line.startsWith('-')) {
        return `<li class="flex gap-2 items-start"><span class="text-indigo-400 flex-shrink-0">•</span><span>${boldLine.slice(1).trim()}</span></li>`
      }
      if (line.match(/^\d+\./)) {
        const rest = line.replace(/^\d+\.\s*/, '')
        return `<li class="flex gap-2 items-start"><span class="text-gray-400 flex-shrink-0 font-mono text-xs mt-0.5">${line.match(/^\d+/)![0]}.</span><span>${rest.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</span></li>`
      }
      if (line.trim() === '') return `<div class="h-2"></div>`
      return `<p>${boldLine}</p>`
    })
    .join('')
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

  const { data: tips } = await supabase
    .from('tips')
    .select('*')
    .order('created_at', { ascending: true })

  const tipList: Tip[] = (tips ?? []) as Tip[]

  // Group by category
  const grouped: Record<string, Tip[]> = {}
  for (const tip of tipList) {
    if (!grouped[tip.category]) grouped[tip.category] = []
    grouped[tip.category].push(tip)
  }

  // Order categories
  const categories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ]

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
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
              {CATEGORY_ICONS[cat] ?? '📌'} {cat}
            </a>
          ))}
        </nav>

        {/* Tips by category */}
        <div className="space-y-12">
          {categories.map((cat) => (
            <section key={cat} id={cat.replace(/\s+/g, '-').toLowerCase()}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{CATEGORY_ICONS[cat] ?? '📌'}</span>
                <h2 className="text-xl font-bold text-gray-900">{cat}</h2>
              </div>

              <div className="space-y-4">
                {grouped[cat].map((tip) => (
                  <article key={tip.id} className="card p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">{tip.title}</h3>
                    <div
                      className="text-sm text-gray-700 leading-relaxed space-y-1 [&_ul]:space-y-1 [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(tip.content) }}
                    />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
