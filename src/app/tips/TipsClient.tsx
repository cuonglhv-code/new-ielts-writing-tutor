'use client'

import { useMemo, useState } from 'react'

export default function TipsClient({ data }: { data: any }) {
  const [activeTaskId, setActiveTaskId] = useState('task_1_academic')
  const [activeBand, setActiveBand] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student')
  const [uiLang, setUiLang] = useState<'en' | 'vi' | 'both'>('both')

  const currentTask = useMemo(() => {
    return data.tasks.find((t: any) => t.task_id === activeTaskId) || data.tasks[0]
  }, [data, activeTaskId])

  // Translation helpers
  const tStr = (obj: any, key: string) => {
    if (!obj) return ''
    const enText = obj[key] || ''
    const viText = obj[`${key}_vi`] || ''
    if (uiLang === 'en') return enText
    if (uiLang === 'vi') return viText || enText
    if (viText) return `${enText} / ${viText}`
    return enText
  }

  const tArr = (obj: any, key: string) => {
    if (!obj) return []
    const enArr = obj[key] || []
    const viArr = obj[`${key}_vi`] || []
    return enArr.map((enText: string, idx: number) => {
      const viText = viArr[idx]
      if (uiLang === 'en') return enText
      if (uiLang === 'vi') return viText || enText
      if (viText) return `${enText} / ${viText}`
      return enText
    })
  }

  // Filter bands
  const matchedBands = useMemo(() => {
    const bandsToSearch = activeBand === 'all'
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
      : [activeBand as number]

    if (!search.trim()) return bandsToSearch

    const term = search.toLowerCase()
    return bandsToSearch.filter((bandNum) => {
      // search band profile
      const bp = currentTask.band_profiles.find((b: any) => b.band === bandNum)
      if (bp && (
        tStr(bp, 'overall_profile').toLowerCase().includes(term) ||
        tArr(bp, 'key_strengths').join(' ').toLowerCase().includes(term) ||
        tArr(bp, 'key_weaknesses').join(' ').toLowerCase().includes(term) ||
        tArr(bp, 'global_upgrade_advice').join(' ').toLowerCase().includes(term)
      )) return true

      // search criteria
      for (const crit of currentTask.criteria) {
        const critBand = crit.bands.find((b: any) => b.band === bandNum)
        if (critBand && (
          tStr(critBand, 'descriptor_summary').toLowerCase().includes(term) ||
          tArr(critBand, 'common_problems').join(' ').toLowerCase().includes(term) ||
          tArr(critBand, 'upgrade_strategies').join(' ').toLowerCase().includes(term)
        )) return true
      }
      return false
    })
  }, [currentTask, activeBand, search, uiLang])

  return (
    <div className="space-y-8 pb-20">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white p-6 sm:p-8">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-200">IELTS Writing Mastery</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">IELTS Academic Writing Tips & Band Guide</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-3xl">
            Writing is scored by TA/TR, CC, LR, and GRA in both tasks. Task 2 carries double weight, so keep Task 1 efficient and build deeper argument quality in Task 2.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {data.tasks.map((task: any) => (
              <button
                key={task.task_id}
                onClick={() => {
                  setActiveTaskId(task.task_id)
                  setActiveBand('all')
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${activeTaskId === task.task_id
                    ? 'bg-white text-indigo-900 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                {tStr(task, 'task_name')}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-2xl" />
      </section>

      {/* Control Bar (Search, Band Ladder, View Toggles) */}
      <section className="card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search band, problem, strategy..."
            className="input-field max-w-sm"
          />

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex rounded-lg bg-gray-100 p-1 border border-gray-200">
              <button onClick={() => setViewMode('student')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${viewMode === 'student' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Student View</button>
              <button onClick={() => setViewMode('teacher')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${viewMode === 'teacher' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Teacher View</button>
            </div>

            <div className="flex rounded-lg bg-gray-100 p-1 border border-gray-200">
              <button onClick={() => setUiLang('en')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${uiLang === 'en' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>EN</button>
              <button onClick={() => setUiLang('vi')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${uiLang === 'vi' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>VI</button>
              <button onClick={() => setUiLang('both')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${uiLang === 'both' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Both</button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Band Ladder</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveBand('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border whitespace-nowrap ${activeBand === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              All Bands
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bandNum) => (
              <button
                key={bandNum}
                onClick={() => setActiveBand(bandNum)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border whitespace-nowrap ${activeBand === bandNum
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                Band {bandNum}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {matchedBands.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No content matches your search.</div>
      ) : (
        matchedBands.map((bandNum) => (
          <div key={bandNum} className="space-y-6 animate-fade-in pb-12">

            {/* Band Card */}
            <BandProfileCard
              bandNum={bandNum}
              currentTask={currentTask}
              tStr={tStr}
              tArr={tArr}
              viewMode={viewMode}
            />

            {/* Criteria Drill Down (only show if a specific band is selected, or if search is active across all) 
                Actually, to keep it clean, let's always show it, but inside an accordion or just cleanly spaced. */}
            {activeBand !== 'all' && (
              <CriteriaDrillDown
                bandNum={bandNum}
                currentTask={currentTask}
                tStr={tStr}
                tArr={tArr}
                viewMode={viewMode}
              />
            )}

          </div>
        ))
      )}

      {/* Band-Range Strategy Panels (Bottom) */}
      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Study Plans by Band Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTask.level_strategies.map((ls: any, idx: number) => (
            <article key={idx} className="card p-5 border-l-4 border-indigo-500">
              <h3 className="text-lg font-bold text-gray-900">Band {ls.band_range} Strategy</h3>

              <div className="mt-4 space-y-4">
                {(viewMode === 'teacher' || viewMode === 'student') && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Target Focus Areas</h4>
                    <ul className="space-y-1">
                      {tArr(ls, 'focus_areas').map((item: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-indigo-400">•</span> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Practice Recommendations</h4>
                  <ul className="space-y-1">
                    {tArr(ls, 'practice_recommendations').map((item: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-500">✓</span> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-orange-800 mb-2 flex items-center gap-1">
                    <span>💡</span> Myths vs Reality
                  </h4>
                  <ul className="space-y-1">
                    {tArr(ls, 'myths_to_avoid').map((item: string, i: number) => (
                      <li key={i} className="text-sm text-orange-900 flex gap-2">
                        <span className="text-orange-500">×</span> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  )
}

function BandProfileCard({ bandNum, currentTask, tStr, tArr, viewMode }: any) {
  const profile = currentTask.band_profiles.find((b: any) => b.band === bandNum)
  if (!profile) return null

  return (
    <div className="card p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10" />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{tStr(currentTask, 'task_name')}</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Band {bandNum} Overview</h2>
        </div>
      </div>

      <p className="mt-4 text-gray-700 font-medium leading-relaxed bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-gray-100">
        {tStr(profile, 'overall_profile')}
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
            <span className="bg-green-100 w-6 h-6 flex items-center justify-center rounded-full">✓</span> Strengths
          </h4>
          <ul className="space-y-2">
            {tArr(profile, 'key_strengths').map((s: string, i: number) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-400">•</span> {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-3">
            <span className="bg-red-100 w-6 h-6 flex items-center justify-center rounded-full">⚠</span> Weaknesses
          </h4>
          <ul className="space-y-2">
            {tArr(profile, 'key_weaknesses').map((s: string, i: number) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-red-400">•</span> {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <details className="mt-6 group border border-indigo-100 rounded-lg bg-indigo-50/30">
        <summary className="p-3 cursor-pointer list-none flex justify-between items-center text-sm font-bold text-indigo-900">
          <span className="flex items-center gap-2"><span>🚀</span> Global Upgrade Advice</span>
          <span className="transition-transform group-open:rotate-180">▼</span>
        </summary>
        <div className="p-3 pt-0 border-t border-indigo-100">
          <ul className="space-y-2 mt-2">
            {tArr(profile, 'global_upgrade_advice').map((s: string, i: number) => (
              <li key={i} className="text-sm text-indigo-800 flex gap-2"><span className="text-indigo-400">→</span> {s}</li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}


function CriteriaDrillDown({ bandNum, currentTask, tStr, tArr, viewMode }: any) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Criteria Drill Down</h3>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {currentTask.criteria.map((crit: any) => {
          const critBand = crit.bands.find((b: any) => b.band === bandNum)
          if (!critBand) return null

          return (
            <div key={crit.criterion_id} className="card p-5 bg-white border border-gray-200">
              <h4 className="text-md font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">
                {tStr(crit, 'criterion_name')}
              </h4>
              <p className="text-sm text-gray-600 font-medium mb-2">
                {tStr(critBand, 'descriptor_summary')}
              </p>
              <p className="text-sm text-gray-500 italic mb-4">
                "{tStr(critBand, 'typical_performance')}"
              </p>

              <div className="space-y-4">
                {(viewMode === 'teacher' || viewMode === 'student') && (
                  <div className={viewMode === 'teacher' ? 'bg-red-50 p-3 rounded-lg border border-red-100' : ''}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1 ${viewMode === 'teacher' ? 'text-red-800' : 'text-gray-500'}`}>
                      {viewMode === 'teacher' ? '⚠️ Common Problems (Diagnostic)' : 'Common Traps'}
                    </p>
                    <ul className="space-y-1.5">
                      {tArr(critBand, 'common_problems').map((s: string, i: number) => (
                        <li key={i} className={`text-sm flex gap-2 ${viewMode === 'teacher' ? 'text-red-900' : 'text-gray-600'}`}>
                          <span className={viewMode === 'teacher' ? 'text-red-400' : 'text-red-300'}>×</span> <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={viewMode === 'student' ? 'bg-green-50 p-3 rounded-lg border border-green-100' : ''}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1 ${viewMode === 'student' ? 'text-green-800' : 'text-gray-500'}`}>
                    {viewMode === 'student' ? '🚀 Upgrade Strategies (Actionable)' : 'Upgrade Strategies'}
                  </p>
                  <ul className="space-y-1.5">
                    {tArr(critBand, 'upgrade_strategies').map((s: string, i: number) => (
                      <li key={i} className={`text-sm flex gap-2 ${viewMode === 'student' ? 'text-green-900' : 'text-gray-600'}`}>
                        <span className={viewMode === 'student' ? 'text-green-500' : 'text-green-400'}>↑</span> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
