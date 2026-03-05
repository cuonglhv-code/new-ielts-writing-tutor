
'use client'

import { useState } from 'react'
import tipsData from '@/lib/ielts-liz-tips.json'

export default function IeltsLizTips() {
  const [activeTab, setActiveTab] = useState('task1')
  const [activeSubTab, setActiveSubTab] = useState('academic')

  const renderContent = (content) => {
    if (!content) return null
    return content.map((item, index) => {
      if (item.type === 'paragraph') {
        return <p key={index} className="mb-4">{item.text}</p>
      }
      if (item.type === 'list') {
        return (
          <ul key={index} className="list-disc list-inside mb-4">
            {item.items.map((li, i) => (
              <li key={i}>{li}</li>
            ))}
          </ul>
        )
      }
      return (
        <div key={index} className="card p-6 border border-gray-200 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
          <p className="mt-4 text-gray-700">{item.content}</p>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
            Read more
          </a>
        </div>
      )
    })
  }

  return (
    <div className="space-y-8 pb-20">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white p-6 sm:p-8">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-200">IELTS Writing Mastery</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">IELTS Academic Writing Tips from IELTS Liz</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-3xl">
            Browse tips for IELTS Writing Task 1 and Task 2.
          </p>
        </div>
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-2xl" />
      </section>

      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'task1' ? 'border-b-2 border-indigo-600 font-semibold' : ''}`}
          onClick={() => setActiveTab('task1')}
        >
          Writing Task 1
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'task2' ? 'border-b-2 border-indigo-600 font-semibold' : ''}`}
          onClick={() => setActiveTab('task2')}
        >
          Writing Task 2
        </button>
      </div>

      <div>
        {activeTab === 'task1' && (
          <div>
            <div className="flex border-b mt-4">
              <button
                className={`py-2 px-4 ${activeSubTab === 'academic' ? 'border-b-2 border-indigo-500' : ''}`}
                onClick={() => setActiveSubTab('academic')}
              >
                Academic
              </button>
              <button
                className={`py-2 px-4 ${activeSubTab === 'general_training' ? 'border-b-2 border-indigo-500' : ''}`}
                onClick={() => setActiveSubTab('general_training')}
              >
                General Training
              </button>
            </div>
            <div className="mt-4">
              {activeSubTab === 'academic' ? renderContent(tipsData.task1.academic) : renderContent(tipsData.task1.general_training)}
            </div>
          </div>
        )}

        {activeTab === 'task2' && (
          <div className="mt-4">
            {renderContent(tipsData.task2.essay_types)}
          </div>
        )}
      </div>
    </div>
  )
}
