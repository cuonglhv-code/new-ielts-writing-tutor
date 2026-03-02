'use client'

import { useMemo, useState } from 'react'
import type { Tip } from '@/lib/types' // I will need to create this type

export default function NewTipsClient({ tips }: { tips: Tip[] }) {
  const [activeTask, setActiveTask] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')

  const filteredTips = useMemo(() => {
    return tips
      .filter(tip => {
        if (activeTask === 'all') return true
        return tip.task_filter === activeTask
      })
      .filter(tip => {
        if (!search.trim()) return true
        return tip.title.toLowerCase().includes(search.toLowerCase())
      })
  }, [tips, activeTask, search])

  return (
    <div className="space-y-8 pb-20">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white p-6 sm:p-8">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-200">IELTS Writing Mastery</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">IELTS Academic Writing Tips</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-3xl">
            Browse tips for IELTS Writing Task 1 and Task 2.
          </p>
        </div>
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-2xl" />
      </section>

      {/* Control Bar (Search, Task filter) */}
      <section className="card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a tip..."
            className="input-field max-w-sm"
          />

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex rounded-lg bg-gray-100 p-1 border border-gray-200">
              <button onClick={() => setActiveTask('all')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${activeTask === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>All</button>
              <button onClick={() => setActiveTask(1)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${activeTask === 1 ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Task 1</button>
              <button onClick={() => setActiveTask(2)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${activeTask === 2 ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Task 2</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {filteredTips.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No tips match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map(tip => (
                <div key={tip.id} className="card p-6 border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">{tip.title}</h2>
                    <div className="mt-4 text-gray-700 space-y-4" dangerouslySetInnerHTML={{ __html: tip.content.replace(/
/g, '<br />') }} />
                    <div className="mt-4 text-xs text-gray-500">
                        <a href={tip.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                            Source: {tip.source_title}
                        </a>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  )
}
