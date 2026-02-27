export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }[size]

  return (
    <div
      className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeClass}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  )
}
