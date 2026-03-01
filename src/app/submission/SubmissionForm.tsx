'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubmissionForm() {
    const [phase, setPhase] = useState<'setup' | 'write'>('setup')
    const [questionText, setQuestionText] = useState('')
    const [essayText, setEssayText] = useState('')
    const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2')
    const [attachedFile, setAttachedFile] = useState<{ type: string, data: string, name: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type === 'text/plain') {
            const text = await file.text()
            setQuestionText(text)
        } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = () => {
                const base64Data = (reader.result as string).split(',')[1]
                setAttachedFile({
                    type: file.type,
                    data: base64Data,
                    name: file.name
                })
            }
            reader.readAsDataURL(file)
        } else {
            alert('Unsupported file type. Please upload a .txt, image, or .pdf file.')
        }
    }

    const startWriting = () => {
        if (!questionText.trim() && !attachedFile) {
            alert('Please provide a question (text or attachment) before writing.')
            return
        }
        setPhase('write')
    }

    const handleSubmit = async () => {
        if (essayText.trim().split(/\s+/).length < 50) {
            alert(`Your answer must be at least 50 words. Current count: ${essayText.trim().split(/\s+/).length}`)
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
                    taskType,
                    attachedFile
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

    if (phase === 'setup') {
        return (
            <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Writing Practice</h1>
                    <p className="text-gray-600">Provide the question details below, then enter the exam simulator to write your response.</p>
                </div>

                <div className="card p-6 md:p-8 border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-800 mb-2">Task Type</label>
                        <select
                            value={taskType}
                            onChange={(e) => setTaskType(e.target.value as 'task1' | 'task2')}
                            className="input-field max-w-sm"
                        >
                            <option value="task1">Task 1 (Report/Letter)</option>
                            <option value="task2">Task 2 (Essay)</option>
                        </select>
                    </div>

                    <div className="mb-6 border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-800">Question Content</label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Type the question text, or upload a screenshot (highly recommended for Task 1 charts).
                                </p>
                            </div>
                            <div>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".txt,image/*,.pdf"
                                    onChange={handleFileUpload}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer text-sm font-medium bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors"
                                >
                                    + Attach image/pdf
                                </label>
                            </div>
                        </div>

                        {attachedFile && (
                            <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md flex items-center justify-between border border-green-100">
                                <span className="text-sm">📎 Attached: <strong>{attachedFile.name}</strong></span>
                                <button
                                    onClick={() => setAttachedFile(null)}
                                    className="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 rounded bg-red-white hover:bg-red-50"
                                >
                                    REMOVE
                                </button>
                            </div>
                        )}

                        <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="e.g. The chart below shows the number of adults participating in major sports..."
                            className="input-field min-h-[160px]"
                        />
                    </div>

                    <button
                        onClick={startWriting}
                        className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-800 transition-colors shadow-md"
                    >
                        Start Writing Practice →
                    </button>
                </div>
            </div>
        )
    }

    // Write Phase (IELTS CBT Simulator UI)
    const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0

    return (
        <div className="max-w-[1300px] mx-auto min-h-[calc(100vh-120px)] flex flex-col bg-[#f0f0f0] border border-gray-300 shadow-md h-full">
            {/* CBT Header */}
            <div className="bg-[#e4e4e4] border-b border-gray-300 p-4 shrink-0">
                <h2 className="font-bold text-sm text-gray-900 pb-1">Part {taskType === 'task1' ? 1 : 2}</h2>
                <p className="text-xs text-black font-medium pb-2">
                    You should spend about {taskType === 'task1' ? 20 : 40} minutes on this task. Write at least {taskType === 'task1' ? 150 : 250} words.
                </p>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col md:flex-row bg-white overflow-hidden">
                {/* Left side: Question prompt */}
                <div className="w-full md:w-1/2 md:border-r-2 md:border-gray-300 p-6 sm:p-8 overflow-y-auto">
                    {questionText && (
                        <div className="text-sm font-semibold text-gray-900 whitespace-pre-wrap leading-relaxed mb-6 space-y-4">
                            {questionText.split('\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    )}
                    {attachedFile && attachedFile.type.startsWith('image/') && (
                        <img
                            src={`data:${attachedFile.type};base64,${attachedFile.data}`}
                            alt="Question chart/diagram"
                            className="max-w-full h-auto object-contain border border-gray-200"
                        />
                    )}
                    {attachedFile?.type === 'application/pdf' && (
                        <div className="p-4 bg-gray-100 border border-gray-300 text-sm text-gray-600 flex items-center gap-2">
                            <span>📄 PDF Document attached: <strong>{attachedFile.name}</strong></span>
                        </div>
                    )}
                </div>

                {/* Right side: Writing Area */}
                <div className="w-full md:w-1/2 bg-white flex flex-col p-4 sm:p-8 min-h-[400px]">
                    <div className="flex-1 w-full flex flex-col relative rounded-sm border border-gray-300 p-1 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                        <textarea
                            value={essayText}
                            onChange={(e) => setEssayText(e.target.value)}
                            placeholder="Start typing your response here..."
                            className="flex-1 w-full bg-white p-2 resize-none outline-none text-[15px] leading-relaxed text-gray-900 border-none"
                            spellCheck={false}
                        />
                        <div className="text-xs text-gray-600 p-2 text-right border-t border-gray-100 bg-[#fafafa]">
                            Words: {wordCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* CBT Footer */}
            <div className="bg-white border-t border-gray-300 p-3 shrink-0 flex justify-between items-center px-6">
                <button
                    onClick={() => setPhase('setup')}
                    className="flex text-sm items-center gap-2 text-gray-600 hover:text-black font-semibold transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
                >
                    <span className="text-xl leading-none">←</span> Edit Question
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex text-sm items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? (
                        'Marking...'
                    ) : (
                        <>
                            Submit & Mark <span className="text-lg leading-none">✓</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
