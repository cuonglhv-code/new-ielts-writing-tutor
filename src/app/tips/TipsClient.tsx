'use client'

import { useMemo, useState } from 'react'
import type { GuideBand, GuideCriterion, GuideData, GuideTask } from './types'

function getBandOrder(bands: Record<string, GuideBand>): string[] {
  return Object.keys(bands).sort((a, b) => Number(a) - Number(b))
}

function getCriteriaLabel(code: string, taskId: string): string {
  if (code === 'TA' && taskId === 'task1') return 'Task Achievement'
  if (code === 'TR' && taskId === 'task2') return 'Task Response'
  if (code === 'CC') return 'Coherence & Cohesion'
  if (code === 'LR') return 'Lexical Resource'
  if (code === 'GRA') return 'Grammar Range & Accuracy'
  return code
}

function getUpgradeItems(criterion: GuideCriterion): string[] {
  return [
    ...(criterion.upgradeTo6 ?? []),
    ...(criterion.upgradeTo7 ?? []),
    ...(criterion.upgradeTo8 ?? []),
    ...(criterion.upgradeTo9 ?? []),
    ...(criterion.maintain ?? []),
  ]
}

function bandMatchesQuery(task: GuideTask, bandKey: string, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const band = task.bands[bandKey]
  if (band.summary.toLowerCase().includes(q)) return true

  for (const [criterionKey, criterion] of Object.entries(band.criteria)) {
    if (criterionKey.toLowerCase().includes(q)) return true
    if (criterion.keyPhrase.toLowerCase().includes(q)) return true
    if (getUpgradeItems(criterion).some((line) => line.toLowerCase().includes(q))) return true
  }

  return false
}

function bundleMatchesQuery(task: GuideTask, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return task.tipBundles.some((bundle) => {
    if (bundle.label.toLowerCase().includes(q)) return true
    if (bundle.bandTarget.toLowerCase().includes(q)) return true
    return bundle.tips.some((tip) => tip.toLowerCase().includes(q))
  })
}

export default function TipsClient({ data }: { data: GuideData }) {
  const [activeTask, setActiveTask] = useState(data.tasks[0]?.id ?? 'task1')
  const [selectedBand, setSelectedBand] = useState('all')
  const [search, setSearch] = useState('')

  const currentTask = useMemo(
    () => data.tasks.find((task) => task.id === activeTask) ?? data.tasks[0],
    [data.tasks, activeTask]
  )

  const bandOrder = useMemo(
    () => (currentTask ? getBandOrder(currentTask.bands) : []),
    [currentTask]
  )

  const visibleBands = useMemo(() => {
    if (!currentTask) return []
    return bandOrder.filter((bandKey) => {
      if (selectedBand !== 'all' && selectedBand !== bandKey) return false
      return bandMatchesQuery(currentTask, bandKey, search)
    })
  }, [currentTask, bandOrder, selectedBand, search])

  const visibleBundles = useMemo(() => {
    if (!currentTask) return []
    if (!search) return currentTask.tipBundles
    const q = search.toLowerCase()
    return currentTask.tipBundles.filter((bundle) => {
      if (bundle.label.toLowerCase().includes(q)) return true
      if (bundle.bandTarget.toLowerCase().includes(q)) return true
      return bundle.tips.some((tip) => tip.toLowerCase().includes(q))
    })
  }, [currentTask, search])

  if (!currentTask) {
    return (
      <div className="card p-6 text-sm text-gray-600">
        Tips data is unavailable. Please check `IELTS-Writing-Guide.md`.
      </div>
    )
  }

  const matchCount = visibleBands.length + (bundleMatchesQuery(currentTask, search) ? visibleBundles.length : 0)

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white p-6 sm:p-8">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-200">IELTS Writing Mastery</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">IELTS Writing Tips & Band Guide</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-3xl">
            Writing is scored by TA/TR, CC, LR, and GRA in both tasks. Task 2 carries double weight, so keep Task 1
            efficient and build deeper argument quality in Task 2.
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="rounded-lg bg-white/10 p-3 border border-white/20">
              <p className="font-semibold">4 Criteria</p>
              <p className="text-slate-200 mt-1">TA/TR, CC, LR, GRA</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3 border border-white/20">
              <p className="font-semibold">Task Weighting</p>
              <p className="text-slate-200 mt-1">Task 2 = 2x Task 1</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3 border border-white/20">
              <p className="font-semibold">Focus</p>
              <p className="text-slate-200 mt-1">Find your band gap, then drill upgrades</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-2xl" />
      </section>

      <section className="card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {data.tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                setActiveTask(task.id)
                setSelectedBand('all')
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                activeTask === task.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {task.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by band, criterion, or tip..."
            className="input-field"
          />
          <div className="text-xs sm:text-sm text-gray-500 sm:text-right self-center">
            {search ? `${matchCount} matching sections` : 'Browse by band or drill bundle'}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Band Ladder</h2>
          <span className="text-xs text-gray-500">Choose one band or view all</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedBand('all')}
            className={`px-3 py-2 rounded-lg text-sm border whitespace-nowrap ${
              selectedBand === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-slate-500'
            }`}
          >
            All Bands
          </button>
          {bandOrder.map((bandKey) => (
            <button
              key={bandKey}
              onClick={() => setSelectedBand(bandKey)}
              className={`px-3 py-2 rounded-lg text-sm border whitespace-nowrap ${
                selectedBand === bandKey
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
              }`}
            >
              Band {bandKey}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Band Cards</h2>
        {visibleBands.length === 0 ? (
          <div className="card p-8 text-sm text-gray-500">No band cards match your search.</div>
        ) : (
          visibleBands.map((bandKey) => {
            const band = currentTask.bands[bandKey]
            return (
              <details key={bandKey} className="card p-5 group" open={selectedBand !== 'all'}>
                <summary className="list-none cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        {currentTask.label}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">Band {bandKey}</h3>
                    </div>
                    <span className="text-xs font-medium text-gray-500 group-open:text-indigo-600">
                      Tap to {selectedBand !== 'all' ? 'collapse' : 'expand'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{band.summary}</p>
                </summary>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {Object.entries(band.criteria).map(([criterionCode, criterion]) => {
                    const nextMoves = getUpgradeItems(criterion)
                    return (
                      <article key={criterionCode} className="rounded-xl border border-gray-200 p-4 bg-gray-50/60">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-gray-900">
                            {criterionCode} · {getCriteriaLabel(criterionCode, currentTask.id)}
                          </h4>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{criterion.keyPhrase}</p>
                        {nextMoves.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              How to move up
                            </p>
                            <ul className="mt-2 space-y-1.5">
                              {nextMoves.map((move, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex gap-2">
                                  <span className="text-indigo-500 mt-0.5">•</span>
                                  <span>{move}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </details>
            )
          })
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Tips & Drills</h2>
        {visibleBundles.length === 0 ? (
          <div className="card p-8 text-sm text-gray-500">No tip bundles match your search.</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {visibleBundles.map((bundle) => (
              <article key={bundle.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-gray-900">{bundle.label}</h3>
                  <span className="badge bg-indigo-100 text-indigo-700">{bundle.bandTarget}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Target: {currentTask.label}</p>
                <ul className="mt-3 space-y-2">
                  {bundle.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

