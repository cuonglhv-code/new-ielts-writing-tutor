'use client'

import { useState } from 'react'
import { addQuestion, addTip } from '@/app/admin/actions'

interface AdminDashboardProps {
    stats: {
        studentCount: number
        teacherCount: number
        totalPractices: number
        avgScore: string | number
        demographics: {
            under18: number
            range18to24: number
            range25to34: number
            plus35: number
            unknown: number
        }
    }
    exportData: any[]
}

export default function AdminDashboard({ stats, exportData }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview')

    const handleExport = () => {
        const headers = ['FullName', 'Age', 'Background', 'Joined']
        const csvContent = [
            headers.join(','),
            ...exportData.map(row =>
                [row.FullName, row.Age, row.Background, row.Joined].map((f: any) => `"${f || ''}"`).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div>
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 px-1 ${activeTab === 'overview' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
                >
                    Overview & Stats
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`pb-2 px-1 ${activeTab === 'content' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
                >
                    Content Management
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard label="Total Students" value={stats.studentCount} />
                        <StatCard label="Total Teachers" value={stats.teacherCount} />
                        <StatCard label="Total Practices" value={stats.totalPractices} />
                        <StatCard label="Avg Band Score" value={stats.avgScore} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Student Demographics (Age)</h3>
                            <ul className="space-y-2">
                                <DemoRow label="Under 18" count={stats.demographics.under18} total={stats.studentCount} />
                                <DemoRow label="18 - 24" count={stats.demographics.range18to24} total={stats.studentCount} />
                                <DemoRow label="25 - 34" count={stats.demographics.range25to34} total={stats.studentCount} />
                                <DemoRow label="35+" count={stats.demographics.plus35} total={stats.studentCount} />
                                <DemoRow label="Unknown" count={stats.demographics.unknown} total={stats.studentCount} />
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                            <h3 className="text-lg font-semibold mb-2">Data Export</h3>
                            <p className="text-gray-500 mb-6">Download a CSV file containing all registered student profiles.</p>
                            <button
                                onClick={handleExport}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Export Student CSV
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <ContentManager />
            )}
        </div>
    )
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
    )
}

function DemoRow({ label, count, total }: { label: string, count: number, total: number }) {
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0
    return (
        <li className="flex justify-between items-center">
            <span className="text-gray-600">{label}</span>
            <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-medium w-12 text-right">{count}</span>
            </div>
        </li>
    )
}

function ContentManager() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Add Practice Test</h3>
                <form action={async (formData) => {
                    const res = await addQuestion(formData)
                    if (res?.error) alert(res.error)
                    else {
                        alert('Question added!')
                    }
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Type</label>
                        <select name="task_type" className="w-full border rounded-lg p-2">
                            <option value="task1">Task 1</option>
                            <option value="task2">Task 2</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Topic</label>
                            <input name="topic" type="text" placeholder="e.g. Education" className="w-full border rounded-lg p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Difficulty</label>
                            <select name="difficulty" className="w-full border rounded-lg p-2">
                                <option value="Band 5-6">Band 5-6</option>
                                <option value="Band 6-7">Band 6-7</option>
                                <option value="Band 7-8">Band 7-8</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Question Text</label>
                        <textarea name="question_text" rows={4} className="w-full border rounded-lg p-2" required />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                        Add Question
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Add Tip / Vocab / Grammar</h3>
                <form action={async (formData) => {
                    const res = await addTip(formData)
                    if (res?.error) alert(res.error)
                    else alert('Content added!')
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="category" className="w-full border rounded-lg p-2">
                            <option value="Vocabulary">Vocabulary</option>
                            <option value="Grammar">Grammar</option>
                            <option value="Task 1 Structure">Task 1 Structure</option>
                            <option value="Task 2 Argument Development">Task 2 Argument</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input name="title" type="text" className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content (Markdown supported)</label>
                        <textarea name="content" rows={6} className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Topic Tag (Internal)</label>
                        <input name="topic_tag" type="text" placeholder="e.g. vocabulary, structure" className="w-full border rounded-lg p-2" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700">
                        Add Content
                    </button>
                </form>
            </div>
        </div>
    )
}
