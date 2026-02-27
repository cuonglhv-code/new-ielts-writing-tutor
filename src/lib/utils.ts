/**
 * Returns a Tailwind colour class based on a band score.
 * red < 5, amber 5–6, green 6.5+
 */
export function bandColourClass(band: number): string {
  if (band >= 6.5) return 'text-emerald-600'
  if (band >= 5.0) return 'text-amber-600'
  return 'text-red-600'
}

export function bandBgClass(band: number): string {
  if (band >= 6.5) return 'bg-emerald-50 border-emerald-200 text-emerald-700'
  if (band >= 5.0) return 'bg-amber-50 border-amber-200 text-amber-700'
  return 'bg-red-50 border-red-200 text-red-700'
}

export function bandLabel(band: number): string {
  if (band >= 8.5) return 'Expert'
  if (band >= 7.5) return 'Very Good'
  if (band >= 6.5) return 'Competent'
  if (band >= 5.5) return 'Modest'
  if (band >= 4.5) return 'Limited'
  return 'Developing'
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calcOverallBand(scores: {
  task_achievement: number
  coherence_cohesion: number
  lexical_resource: number
  grammatical_range: number
}): number {
  const avg =
    (scores.task_achievement +
      scores.coherence_cohesion +
      scores.lexical_resource +
      scores.grammatical_range) /
    4
  // Round to nearest 0.5
  return Math.round(avg * 2) / 2
}
