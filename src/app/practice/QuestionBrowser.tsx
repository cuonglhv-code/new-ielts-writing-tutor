'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Question } from '@/lib/types'

const DIFFICULTIES = ['All', 'Band 5-6', 'Band 6-7', 'Band 7-8']
const TASK_TYPES = ['All', 'task1', 'task2']
const TOPICS = [
  'All',
  'Education',
  'Environment',
  'Health',
  'Society',
  'Technology',
  'Transport',
  'Economy',
  'Other',
]

const difficultyColour: Record<string, string> = {
  'Band 5-6': 'bg-green-100 text-green-700',
  'Band 6-7': 'bg-amber-100 text-amber-700',
  'Band 7-8': 'bg-red-100 text-red-700',
}

const taskLabel: Record<string, string> = {
  task1: 'Task 1',
  task2: 'Task 2',
}

export default function QuestionBrowser({ questions }: { questions: Question[] }) {
  const [taskFilter, setTaskFilter] = useState('All')
  const [diffFilter, setDiffFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')

  const filtered = questions.filter((q) => {
    if (taskFilter !== 'All' && q.task_type !== taskFilter) return false
    if (diffFilter !== 'All' && q.difficulty !== diffFilter) return false
    if (topicFilter !== 'All' && q.topic !== topicFilter) return false
    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <FilterGroup
          label="Task type"
          options={TASK_TYPES}
          value={taskFilter}
          onChange={setTaskFilter}
          labelMap={{ All: 'All types', task1: 'Task 1', task2: 'Task 2' }}
        />
        <FilterGroup
          label="Difficulty"
          options={DIFFICULTIES}
          value={diffFilter}
          onChange={setDiffFilter}
        />
        <FilterGroup
          label="Topic"
          options={TOPICS}
          value={topicFilter}
          onChange={setTopicFilter}
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} question{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Question grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p>No questions match your filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  labelMap,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  labelMap?: Record<string, string>
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              value === opt
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {labelMap?.[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuestionCard({ question }: { question: Question }) {
  const preview = question.question_text.slice(0, 120)

  return (
    <div className="card p-5 hover:shadow-md transition-shadow flex flex-col">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="badge bg-indigo-100 text-indigo-700">
          {taskLabel[question.task_type] ?? question.task_type}
        </span>
        <span className={`badge ${difficultyColour[question.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
          {question.difficulty}
        </span>
        <span className="badge bg-gray-100 text-gray-600">{question.topic}</span>
      </div>

      {/* Preview */}
      <p className="text-sm text-gray-700 flex-1 leading-relaxed">
        {preview}{preview.length === 120 ? '…' : ''}
      </p>

      {/* CTA */}
      <Link
        href={`/practice/${question.id}`}
        className="btn-primary mt-4 text-xs w-full"
      >
        Start writing →
      </Link>
    </div>
  )
}
