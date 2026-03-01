'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubmissionForm() {
    const [questionText, setQuestionText] = useState('')
    const [essayText, setEssayText] = useState('')
    const [taskType, setTaskType] = useState('task2')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // For plain text files
        if (file.type === 'text/plain') {
            const text = await file.text()
            setQuestionText(text)
        } else {
            // Basic fallback: just show the file name as a placeholder,
            // in a real app we would send to an API to extract text (e.g. PDF/Word)
            // Since we don't have a backend parser, we just alert
            alert('Currently only plain text (.txt) files are supported for direct reading in this demo. Please copy-paste the question text.')
        }
    }

    const handleSubmit = async () => {
        if (!questionText.trim() || !essayText.trim()) {
            alert('Please provide both the question and your answer.')
            return
        }

        if (essayText.trim().split(/\s+/).length < 50) {
            alert('Your answer must be at least 50 words.')
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch('/api/submit-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionText,
                    essayText,
                    taskType
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit')
            }

            router.push(`/submission/${data.submissionId}`)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Own Essay</h1>
                <p className="text-gray-600">Provide a question and your answer to get instant AI feedback.</p>
            </div>

            <div className="card p-6 mb-8">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                    <select
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value)}
                        className="input-field"
                    >
                        <option value="task1">Task 1 (Report/Letter)</option>
                        <option value="task2">Task 2 (Essay)</option>
                    </select>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Question Box</label>
                        <div>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".txt"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                + Attach a file (.txt)
                            </label>
                        </div>
                    </div>
                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Paste your IELTS question here..."
                        className="input-field min-h-[120px]"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer Box</label>
                    <textarea
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                        placeholder="Type or paste your answer here..."
                        className="input-field min-h-[300px]"
                    />
                    <div className="mt-2 text-right text-sm text-gray-500">
                        Word count: {essayText.trim() ? essayText.trim().split(/\s+/).length : 0}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-primary w-full text-lg py-3 flex justify-center items-center"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Marking your essay...
                        </>
                    ) : (
                        'Submit to Mark'
                    )}
                </button>
            </div>
        </div>
    )
}
