import { bandBgClass, bandLabel } from '@/lib/utils'

interface BandBadgeProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BandBadge({
  score,
  showLabel = false,
  size = 'md',
  className = '',
}: BandBadgeProps) {
  const colourClass = bandBgClass(score)

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5 font-semibold',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colourClass} ${sizeClass} ${className}`}
    >
      Band {score.toFixed(1)}
      {showLabel && (
        <span className="opacity-70 font-normal">· {bandLabel(score)}</span>
      )}
    </span>
  )
}

export function BandScoreCard({
  label,
  score,
}: {
  label: string
  score: number
}) {
  const colourClass = bandBgClass(score)

  return (
    <div className={`rounded-xl border p-4 ${colourClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{score.toFixed(1)}</p>
      <p className="mt-0.5 text-xs opacity-70">{bandLabel(score)}</p>
    </div>
  )
}
