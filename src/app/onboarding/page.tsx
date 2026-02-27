'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const BACKGROUND_OPTIONS = [
  'Self-study / no formal instruction',
  'English classes at school',
  'University / tertiary level',
  'Lived in an English-speaking country',
  'Private tutoring',
  'Other',
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [bandTarget, setBandTarget] = useState('6.5')
  const [studyHours, setStudyHours] = useState('5')
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Prefetch user to ensure session is live
    supabase.auth.getUser()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        age: parseInt(age, 10) || null,
        band_target: parseFloat(bandTarget),
        study_hours: parseInt(studyHours, 10),
        background,
      })
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Determine where to go based on role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role === 'teacher') {
      router.push('/teacher')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Jaxtina IELTS</h1>
          <p className="text-gray-500 text-sm mt-1 text-center max-w-sm">
            Tell us a little about yourself so we can personalise your experience.
          </p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Set up your profile</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="e.g. Nguyen Van A"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
                placeholder="e.g. 22"
                min={10}
                max={80}
              />
            </div>

            {/* Band target */}
            <div>
              <label htmlFor="bandTarget" className="block text-sm font-medium text-gray-700 mb-1">
                Target IELTS band score
              </label>
              <select
                id="bandTarget"
                value={bandTarget}
                onChange={(e) => setBandTarget(e.target.value)}
                className="input-field"
              >
                {['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map((b) => (
                  <option key={b} value={b}>
                    Band {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Study hours */}
            <div>
              <label htmlFor="studyHours" className="block text-sm font-medium text-gray-700 mb-1">
                Study hours per week
              </label>
              <select
                id="studyHours"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                className="input-field"
              >
                {[1, 2, 3, 5, 7, 10, 14, 20].map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Background */}
            <div>
              <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-1">
                English learning background
              </label>
              <select
                id="background"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="input-field"
              >
                {BACKGROUND_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" /> Saving…
                </span>
              ) : (
                'Continue to dashboard →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
