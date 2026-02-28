'use client'

import styles from './WritingSamples.module.css'

type TaskFilter = 'all' | 'task1' | 'task2'

interface SamplesFilterBarProps {
  task: TaskFilter
  band: 'all' | number
  search: string
  onTaskChange: (task: TaskFilter) => void
  onBandChange: (band: 'all' | number) => void
  onSearchChange: (search: string) => void
  visibleCount: number
}

export default function SamplesFilterBar({
  task,
  band,
  search,
  onTaskChange,
  onBandChange,
  onSearchChange,
  visibleCount,
}: SamplesFilterBarProps) {
  return (
    <section className={styles.filterCard}>
      <div className={styles.filters}>
        <div className={styles.field}>
          <label className={styles.label}>Task</label>
          <select
            className={styles.select}
            value={task}
            onChange={(e) => onTaskChange(e.target.value as TaskFilter)}
          >
            <option value="all">All</option>
            <option value="task1">Task 1</option>
            <option value="task2">Task 2</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Band</label>
          <select
            className={styles.select}
            value={band}
            onChange={(e) => onBandChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Search</label>
          <input
            className={styles.search}
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find words in question or answer..."
          />
        </div>
      </div>
      <p className={styles.helper}>{visibleCount} sample(s) found</p>
    </section>
  )
}

