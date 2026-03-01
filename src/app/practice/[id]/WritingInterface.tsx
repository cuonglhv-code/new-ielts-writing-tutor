'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Question } from '@/lib/types'
import { countWords } from '@/lib/utils'

const TASK_TIMES: Record<string, number> = {
  task1: 20 * 60,
  task2: 40 * 60,
}
const MIN_WORDS: Record<string, number> = {
  task1: 150,
  task2: 250,
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const wordCount = countWords(essay)

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) { setTimerActive(false); return 0 }
      return prev - 1
    })
  }, [])

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerActive, tick])

  async function handleSubmit() {
    if (wordCount < 50) {
      setError(`Please write at least 50 words to submit.`)
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
        throw new Error(data.error ?? 'Submission failed. Please try again.')
      }
      router.push(`/submission/${data.submissionId}`)
    } catch (err: any) {
      setError(err.message || 'Network error.')
      setSubmitting(false)
    }
  }

  const hasImage = question.task_type === 'task1' && !!question.image_url

  return (
    <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-120px)] flex flex-col bg-[#f0f0f0] border border-gray-300 shadow-md h-full mt-4">
      {/* CBT Header */}
      <div className="bg-[#e4e4e4] border-b border-gray-300 p-4 shrink-0 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-sm text-gray-900 pb-1">Part {question.task_type === 'task1' ? 1 : 2}</h2>
          <p className="text-xs text-black font-medium">
            You should spend about {question.task_type === 'task1' ? 20 : 40} minutes on this task. Write at least {minWords} words.
          </p>
        </div>
        <div className="text-right">
          <div className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </div>
          {timeLeft === 0 && <div className="text-xs text-red-600 font-bold">Time's up!</div>}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row bg-white overflow-hidden">
        {/* Left side: Question prompt */}
        <div className="w-full md:w-1/2 md:border-r-2 md:border-gray-300 p-6 sm:p-8 overflow-y-auto">
          {question.question_text && (
            <div className="text-sm font-semibold text-gray-900 whitespace-pre-wrap leading-relaxed mb-6 space-y-4">
              {question.question_text.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
          {hasImage && (
            <img
              src={question.image_url!}
              alt="Task 1 chart/diagram"
              className="max-w-full h-auto object-contain border border-gray-200"
            />
          )}
        </div>

        {/* Right side: Writing Area */}
        <div className="w-full md:w-1/2 bg-white flex flex-col p-4 sm:p-8 min-h-[400px]">
          <div className="flex-1 w-full flex flex-col relative rounded-sm border border-gray-300 p-1 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Start typing your response here..."
              className="flex-1 w-full bg-white p-2 resize-none outline-none text-[15px] leading-relaxed text-gray-900 border-none"
              spellCheck={false}
              disabled={submitting}
            />
            <div className="text-xs text-gray-600 p-2 text-right border-t border-gray-100 bg-[#fafafa]">
              Words: {wordCount}
            </div>
          </div>
          {error && <div className="mt-2 text-xs text-red-600 font-medium">{error}</div>}
        </div>
      </div>

      {/* CBT Footer */}
      <div className="bg-white border-t border-gray-300 p-3 shrink-0 flex justify-between items-center px-6">
        <button
          onClick={() => router.push('/practice')}
          className="text-sm font-semibold text-gray-600 hover:text-black bg-gray-100 px-4 py-2 hover:bg-gray-200 rounded-md transition-colors"
        >
          Exit Practice
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex text-sm items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50"
        >
          {submitting ? 'Marking...' : <>Submit & Mark <span className="text-lg leading-none">✓</span></>}
        </button>
      </div>
    </div>
  )
}
