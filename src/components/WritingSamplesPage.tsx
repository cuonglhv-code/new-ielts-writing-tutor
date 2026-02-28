'use client'

import { useMemo, useState } from 'react'
import { writingSamples } from '@/data/writingSamples'
import type { TaskId, WritingSample } from '@/data/writingSamples'
import SamplesFilterBar from './writingSamples/SamplesFilterBar'
import SampleCard from './writingSamples/SampleCard'
import styles from './writingSamples/WritingSamples.module.css'

type TaskFilter = 'all' | TaskId
type BandFilter = 'all' | number

const taskOrder: TaskId[] = ['task1', 'task2']

function taskHeading(task: TaskId): string {
  return task === 'task1' ? 'Task 1' : 'Task 2'
}

function sortSamples(a: WritingSample, b: WritingSample): number {
  if (a.task !== b.task) return taskOrder.indexOf(a.task) - taskOrder.indexOf(b.task)
  if (a.band !== b.band) return a.band - b.band
  return a.id.localeCompare(b.id)
}

const bandTooltips: Record<number, string> = {
  4: 'Band 4: partial response with limited control and support.',
  5: 'Band 5: generally on-task, but development and control are still basic.',
  6: 'Band 6: clear response with adequate organisation and language range.',
  7: 'Band 7: clear overview/position, good organisation, mostly accurate control.',
  8: 'Band 8: well-developed response with precise language and strong control.',
  9: 'Band 9: fully developed response with natural, flexible and accurate language.',
}

export const WritingSamplesPage: React.FC = () => {
  const [task, setTask] = useState<TaskFilter>('all')
  const [band, setBand] = useState<BandFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return writingSamples.samples
      .filter((sample) => (task === 'all' ? true : sample.task === task))
      .filter((sample) => (band === 'all' ? true : sample.band === band))
      .filter((sample) => {
        if (!q) return true
        return sample.question.toLowerCase().includes(q) || sample.answer.toLowerCase().includes(q)
      })
      .sort(sortSamples)
  }, [task, band, search])

  const grouped = useMemo(() => {
    const map = new Map<string, WritingSample[]>()
    for (const sample of filtered) {
      const key = `${sample.task}-${sample.band}`
      const current = map.get(key)
      if (current) current.push(sample)
      else map.set(key, [sample])
    }
    return map
  }, [filtered])

  const orderedGroupKeys = useMemo(() => {
    const keys: string[] = []
    for (const t of taskOrder) {
      for (let b = 4; b <= 9; b += 1) {
        const key = `${t}-${b}`
        if (grouped.has(key)) keys.push(key)
      }
    }
    return keys
  }, [grouped])

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>IELTS Writing Samples</h1>
        <p className={styles.heroText}>
          Browse banded examples for Task 1 and Task 2. Use filters to compare writing quality by band and quickly
          find relevant sample answers.
        </p>
        <div className={styles.heroMeta}>
          <span className={styles.metaChip}>Bands 4-9</span>
          <span className={styles.metaChip}>Task 1 + Task 2</span>
          <span className={styles.metaChip}>Question + Answer + Band Notes</span>
        </div>
      </header>

      <SamplesFilterBar
        task={task}
        band={band}
        search={search}
        onTaskChange={setTask}
        onBandChange={setBand}
        onSearchChange={setSearch}
        visibleCount={filtered.length}
      />

      {orderedGroupKeys.length === 0 ? (
        <section className={styles.empty}>No samples match these filters. Try a broader search.</section>
      ) : (
        orderedGroupKeys.map((groupKey) => {
          const [taskId, bandId] = groupKey.split('-') as [TaskId, string]
          const samples = grouped.get(groupKey) ?? []
          return (
            <section key={groupKey} className={styles.group}>
              <h2 className={styles.groupTitle} title={bandTooltips[Number(bandId)]}>
                {taskHeading(taskId)} - Band {bandId}
              </h2>
              <div className={styles.grid}>
                {samples.map((sample) => (
                  <SampleCard key={sample.id} sample={sample} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}

