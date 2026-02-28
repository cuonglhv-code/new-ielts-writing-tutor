'use client'

import { useMemo, useState } from 'react'
import type { WritingSample } from '@/data/writingSamples'
import styles from './WritingSamples.module.css'

interface SampleCardProps {
  sample: WritingSample
}

function taskLabel(task: WritingSample['task']): string {
  return task === 'task1' ? 'Task 1' : 'Task 2'
}

function visualLabel(type: WritingSample['visualType']): string {
  if (!type) return ''
  if (type === 'bar') return 'bar chart'
  if (type === 'line') return 'line graph'
  if (type === 'table') return 'table'
  if (type === 'pie') return 'pie chart'
  if (type === 'process') return 'process diagram'
  if (type === 'map') return 'map'
  return type
}

export default function SampleCard({ sample }: SampleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<'question' | 'answer' | null>(null)

  const paragraphs = useMemo(() => sample.answer.split('\n\n').filter(Boolean), [sample.answer])

  async function copyText(field: 'question' | 'answer', text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(null), 1200)
    } catch {
      setCopiedField(null)
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.badgeRow}>
        <span className={styles.badge}>{taskLabel(sample.task)}</span>
        <span className={styles.badge}>Band {sample.band}</span>
        <span className={styles.badge}>{sample.id}</span>
      </div>

      <h4 className={styles.questionTitle}>Question</h4>
      <p className={styles.questionText}>{sample.question}</p>

      {/* Visual hint removed as there are no graphics */}

      <button className={styles.answerToggle} onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Hide answer' : 'Show answer'}
      </button>

      {expanded && (
        <div className={styles.answerBody}>
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className={styles.answerParagraph}>
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <p className={styles.notes}>Why this band: {sample.notes}</p>

      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => copyText('question', sample.question)}
          disabled={copiedField === 'question'}
        >
          {copiedField === 'question' ? 'Copied!' : 'Copy question'}
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => copyText('answer', sample.answer)}
          disabled={copiedField === 'answer'}
        >
          {copiedField === 'answer' ? 'Copied!' : 'Copy answer'}
        </button>
      </div>
    </article>
  )
}

