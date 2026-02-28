'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Question } from '@/lib/types'
import { countWords } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const TASK_TIMES: Record<string, number> = {
  task1: 20 * 60,
  task2: 40 * 60,
}
const MIN_WORDS: Record<string, number> = {
  task1: 150,
  task2: 250,
}

const QUESTION_TYPE_LABEL: Record<string, string> = {
  bar_chart: 'Bar chart', line_graph: 'Line graph', pie_chart: 'Pie chart',
  table: 'Table', process: 'Process diagram', map: 'Map',
  opinion: 'Opinion essay', discussion: 'Discussion essay',
  advantages_disadvantages: 'Adv & Disadv', problem_solution: 'Problem & Solution',
  double_question: 'Double question', mixed: 'Mixed',
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function WritingInterface({ question }: { question: Question }) {
  const router = useRouter()
  const totalTime = TASK_TIMES[question.task_type] ?? 60 * 60
  const minWords = MIN_WORDS[question.task_type] ?? 150

  const [essay, setEssay] = useState('')
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [timerActive, setTimerActive] = useState(true)
  const [timerDismissed, setTimerDismissed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showImage, setShowImage] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const wordCount = countWords(essay)
  const meetsMinimum = wordCount >= minWords

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) { setTimerActive(false); return 0 }
      return prev - 1
    })
  }, [])

  useEffect(() => {
    if (timerActive && !timerDismissed) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerActive, timerDismissed, tick])

  async function handleSubmit() {
    if (!meetsMinimum) {
      setError(`Please write at least ${minWords} words before submitting. Current: ${wordCount} words.`)
      return
    }
    setError('')
    setSubmitting(true)
    setTimerActive(false)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, essayText: essay }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Submission failed. Please try again.')
        setSubmitting(false)
        return
      }
      router.push(`/submission/${data.submissionId}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  const timerColour =
    timeLeft > 300 ? 'text-gray-700' : timeLeft > 60 ? 'text-amber-600' : 'text-red-600'

  const taskLabel = question.task_type === 'task1' ? 'Task 1' : 'Task 2'
  const hasImage = question.task_type === 'task1' && !!question.image_url

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Left: Question panel */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-24">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-indigo-100 text-indigo-700">{taskLabel}</span>
              {question.question_type && (
                <span className="badge bg-violet-100 text-violet-700">
                  {QUESTION_TYPE_LABEL[question.question_type] ?? question.question_type}
                </span>
              )}
              <span className="badge bg-gray-100 text-gray-600">{question.topic}</span>
            </div>

            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {question.question_text}
            </div>

            {/* Task 1 image */}
            {hasImage && (
              <div className="mt-4">
                <button
                  onClick={() => setShowImage((v) => !v)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mb-2"
                >
                  {showImage ? 'Hide chart' : 'Show chart'}
                </button>
                {showImage && (
                  <Image
                    src={question.image_url!}
                    alt="Task 1 chart or diagram"
                    width={400}
                    height={280}
                    className="rounded-lg border border-gray-200 w-full h-auto"
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <p>\u2022 Minimum {minWords} words</p>
              <p>\u2022 Recommended time: {question.task_type === 'task1' ? '20' : '40'} minutes</p>
              {hasImage && <p>\u2022 Refer to the chart above in your response</p>}
            </div>
          </div>
        </div>

        {/* Right: Writing area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Timer */}
          {!timerDismissed && (
            <div className={`card px-4 py-3 flex items-center justify-between ${timeLeft === 0 ? 'bg-red-50 border-red-200' : ''}`}>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-mono font-semibold text-lg ${timerColour}`}>
                  {formatTime(timeLeft)}
                </span>
                {timeLeft === 0 && (
                  <span className="text-xs text-red-600 font-medium">Time&apos;s up!</span>
                )}
              </div>
              <button onClick={() => setTimerDismissed(true)} className="text-xs text-gray-400 hover:text-gray-600">
                Dismiss timer
              </button>
            </div>
          )}

          {/* Writing area */}
          <div className="card p-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">Your response</label>
              <span className={`text-xs font-medium ${meetsMinimum ? 'text-emerald-600' : 'text-gray-400'}`}>
                {wordCount} / {minWords} words{meetsMinimum ? ' \u2713' : ''}
              </span>
            </div>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder={`Write your ${taskLabel} response here\u2026`}
              className="flex-1 w-full min-h-[400px] resize-y text-sm text-gray-800 leading-relaxed p-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-300"
              disabled={submitting}
            />
          </div>

          {/* Word count bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${meetsMinimum ? 'bg-emerald-500' : 'bg-indigo-400'}`}
              style={{ width: `${Math.min((wordCount / minWords) * 100, 100)}%` }}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400 flex-1">
              {submitting
                ? 'Your essay is being assessed by the AI examiner. This may take up to 30 seconds\u2026'
                : !meetsMinimum
                  ? `Write ${minWords - wordCount} more word${minWords - wordCount !== 1 ? 's' : ''} to submit.`
                  : 'Ready to submit! Your essay will be marked by the AI examiner.'}
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting || !meetsMinimum}
              className="btn-primary whitespace-nowrap"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" /> Assessing\u2026
                </span>
              ) : (
                'Submit for marking'
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
