'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Question } from '@/lib/types'

const TASK_TYPES = ['All', 'task1', 'task2']
const TOPICS = [
  'All', 'Education', 'Environment', 'Health', 'Society',
  'Technology', 'Transport', 'Economy', 'Other',
]
const TASK1_TYPES = ['All', 'bar_chart', 'line_graph', 'pie_chart', 'table', 'process', 'map', 'mixed']
const TASK2_TYPES = ['All', 'opinion', 'discussion', 'advantages_disadvantages', 'problem_solution', 'double_question', 'mixed']

const difficultyColour: Record<string, string> = {
  'Band 5-6': 'bg-green-100 text-green-700',
  'Band 6-7': 'bg-amber-100 text-amber-700',
  'Band 7-8': 'bg-red-100 text-red-700',
}

const QUESTION_TYPE_LABEL: Record<string, string> = {
  bar_chart: 'Bar chart', line_graph: 'Line graph', pie_chart: 'Pie chart',
  table: 'Table', process: 'Process', map: 'Map',
  opinion: 'Opinion', discussion: 'Discussion',
  advantages_disadvantages: 'Adv & Disadv', problem_solution: 'Problem & Solution',
  double_question: 'Double Q', mixed: 'Mixed',
}

export default function QuestionBrowser({ questions }: { questions: Question[] }) {
  const [taskFilter, setTaskFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  const questionTypeOptions =
    taskFilter === 'task1' ? TASK1_TYPES :
      taskFilter === 'task2' ? TASK2_TYPES :
        ['All']

  const filtered = questions.filter((q) => {
    if (taskFilter !== 'All' && q.task_type !== taskFilter) return false
    if (topicFilter !== 'All' && q.topic !== topicFilter) return false
    if (typeFilter !== 'All' && q.question_type !== typeFilter) return false
    return true
  })

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <FilterGroup
          label="Task type"
          options={TASK_TYPES}
          value={taskFilter}
          onChange={(v) => { setTaskFilter(v); setTypeFilter('All') }}
          labelMap={{ All: 'All types', task1: 'Task 1', task2: 'Task 2' }}
        />
        <FilterGroup label="Topic" options={TOPICS} value={topicFilter} onChange={setTopicFilter} />
        {taskFilter !== 'All' && (
          <FilterGroup
            label="Question type"
            options={questionTypeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
            labelMap={QUESTION_TYPE_LABEL}
          />
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} question{filtered.length !== 1 ? 's' : ''} found
      </p>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p>No questions match your filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => <QuestionCard key={q.id} question={q} />)}
        </div>
      )}
    </div>
  )
}

function FilterGroup({
  label, options, value, onChange, labelMap,
}: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; labelMap?: Record<string, string>
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${value === opt
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
  const preview = question.question_text.slice(0, 110)
  const hasImage = question.task_type === 'task1' && !!question.image_url

  return (
    <div className="card p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="badge bg-indigo-100 text-indigo-700">
          {question.task_type === 'task1' ? 'Task 1' : 'Task 2'}
        </span>
        {question.question_type && (
          <span className="badge bg-violet-100 text-violet-700">
            {QUESTION_TYPE_LABEL[question.question_type] ?? question.question_type}
          </span>
        )}
        <span className={`badge ${difficultyColour[question.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
          {question.difficulty}
        </span>
        <span className="badge bg-gray-100 text-gray-600">{question.topic}</span>
      </div>

      {hasImage && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={question.image_url!}
            alt="Task 1 chart"
            width={300}
            height={160}
            className="w-full h-auto object-contain"
          />
        </div>
      )}

      <p className="text-sm text-gray-700 flex-1 leading-relaxed">
        {preview}{preview.length === 110 ? '\u2026' : ''}
      </p>

      <Link href={`/practice/${question.id}`} className="btn-primary mt-4 text-xs w-full text-center block">
        Start writing
      </Link>
    </div>
  )
}
