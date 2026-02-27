'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  criteriaAvg: {
    task_achievement: number
    coherence_cohesion: number
    lexical_resource: number
    grammatical_range: number
  }
}

function bandColour(score: number) {
  if (score >= 6.5) return '#10b981'
  if (score >= 5.0) return '#f59e0b'
  return '#ef4444'
}

export default function TeacherAggregateChart({ criteriaAvg }: Props) {
  const data = [
    { name: 'Task Achievement', score: Number(criteriaAvg.task_achievement.toFixed(2)) },
    { name: 'Coherence & Cohesion', score: Number(criteriaAvg.coherence_cohesion.toFixed(2)) },
    { name: 'Lexical Resource', score: Number(criteriaAvg.lexical_resource.toFixed(2)) },
    { name: 'Grammatical Range', score: Number(criteriaAvg.grammatical_range.toFixed(2)) },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 9]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number) => [value.toFixed(2), 'Avg band']}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={bandColour(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
