'use client'

import { useState } from 'react'
import type { Tip } from '@/lib/types'

const CATEGORY_ICONS: Record<string, string> = {
  'Task 1 Structure':              '\u{1F4CA}',
  'Task 2 Argument Development':   '\u270D\uFE0F',
  'Vocabulary':                    '\u{1F4DA}',
  'Grammar':                       '\u{1F524}',
  'Time Management':               '\u23F1\uFE0F',
}

const TASK_FILTER_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Task 1', value: '1' },
  { label: 'Task 2', value: '2' },
]

const TOPIC_OPTIONS = [
  { label: 'Tất cả chủ đề', value: 'all' },
  { label: 'Task Achievement', value: 'task_achievement' },
  { label: 'Coherence & Cohesion', value: 'coherence' },
  { label: 'Vocabulary', value: 'vocabulary' },
  { label: 'Grammar', value: 'grammar' },
  { label: 'Cấu trúc bài', value: 'structure' },
  { label: 'Quản lý thời gian', value: 'time' },
]

function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  const parts: string[] = []
  let inBulletList = false
  let inOrderedList = false

  const closeOpenList = () => {
    if (inBulletList)  { parts.push('</ul>'); inBulletList = false }
    if (inOrderedList) { parts.push('</ol>'); inOrderedList = false }
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()
    const boldLine = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    if (trimmed.startsWith('\u2611')) {
      if (!inBulletList) { closeOpenList(); parts.push('<ul class="space-y-1 my-1">'); inBulletList = true }
      parts.push(`<li class="flex gap-2 items-start"><span class="text-emerald-500 flex-shrink-0 mt-0.5">\u2611</span><span>${boldLine.slice(1).trim()}</span></li>`)
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('\u2022 ')) {
      if (!inBulletList) { closeOpenList(); parts.push('<ul class="space-y-1 my-1">'); inBulletList = true }
      const content = boldLine.slice(2).trim()
      parts.push(`<li class="flex gap-2 items-start"><span class="text-indigo-400 flex-shrink-0 mt-0.5 select-none">&bull;</span><span>${content}</span></li>`)
    } else if (trimmed.match(/^\d+\.\s/)) {
      if (!inOrderedList) { closeOpenList(); parts.push('<ol class="space-y-1 my-1">'); inOrderedList = true }
      const num = trimmed.match(/^(\d+)/)![1]
      const rest = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      parts.push(`<li class="flex gap-2 items-start"><span class="text-gray-400 flex-shrink-0 font-mono text-xs mt-0.5">${num}.</span><span>${rest}</span></li>`)
    } else {
      closeOpenList()
      if (trimmed === '') {
        parts.push('<div class="h-2"></div>')
      } else {
        parts.push(`<p class="leading-relaxed">${boldLine}</p>`)
      }
    }
  }

  closeOpenList()
  return parts.join('')
}

export default function TipsClient({ tips }: { tips: Tip[] }) {
  const [taskFilter, setTaskFilter]   = useState('all')
  const [topicFilter, setTopicFilter] = useState('all')
  const [search, setSearch]           = useState('')

  const filtered = tips.filter((tip) => {
    if (taskFilter === '1' && tip.task_filter !== 1) return false
    if (taskFilter === '2' && tip.task_filter !== 2) return false
    if (topicFilter !== 'all' && tip.topic_tag !== topicFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!tip.title.toLowerCase().includes(q) && !tip.content.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Group by category
  const ORDER = [
    'Task 1 Structure',
    'Task 2 Argument Development',
    'Vocabulary',
    'Grammar',
    'Time Management',
  ]
  const grouped: Record<string, Tip[]> = {}
  for (const tip of filtered) {
    if (!grouped[tip.category]) grouped[tip.category] = []
    grouped[tip.category].push(tip)
  }
  const categories = [
    ...ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !ORDER.includes(c)),
  ]

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm mẹo học\u2026"
          className="input-field flex-1 text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {TASK_FILTER_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setTaskFilter(o.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                taskFilter === o.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TOPIC_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setTopicFilter(o.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              topicFilter === o.value
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-violet-400'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {categories.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p>No tips match your filters.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((cat) => (
            <section key={cat} id={cat.replace(/\s+/g, '-').toLowerCase()}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{CATEGORY_ICONS[cat] ?? '\u{1F4CC}'}</span>
                <h2 className="text-xl font-bold text-gray-900">{cat}</h2>
              </div>
              <div className="space-y-4">
                {grouped[cat].map((tip) => (
                  <article key={tip.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-base font-semibold text-gray-900">{tip.title}</h3>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {tip.task_filter === 1 && (
                          <span className="badge bg-indigo-100 text-indigo-700">Task 1</span>
                        )}
                        {tip.task_filter === 2 && (
                          <span className="badge bg-emerald-100 text-emerald-700">Task 2</span>
                        )}
                        {tip.topic_tag && (
                          <span className="badge bg-gray-100 text-gray-600">{tip.topic_tag}</span>
                        )}
                      </div>
                    </div>
                    <div
                      className="text-sm text-gray-700 leading-relaxed space-y-1 [&_ul]:space-y-1 [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(tip.content) }}
                    />
                    {tip.source_url && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <a
                          href={tip.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          Source: {tip.source_title ?? tip.source_url}
                        </a>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
