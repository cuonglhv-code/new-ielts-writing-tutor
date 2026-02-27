'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Submission } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Props {
  submissions: Submission[]
}

export default function StudentChart({ submissions }: Props) {
  const data = submissions.map((s, i) => ({
    name: i + 1,
    date: formatDate(s.submitted_at),
    'Task Achievement': s.band_scores?.task_achievement,
    'Coherence & Cohesion': s.band_scores?.coherence_cohesion,
    'Lexical Resource': s.band_scores?.lexical_resource,
    'Grammatical Range': s.band_scores?.grammatical_range,
    Overall: s.overall_band,
  }))

  const lines = [
    { key: 'Overall', colour: '#4f46e5', width: 2.5 },
    { key: 'Task Achievement', colour: '#10b981', width: 1.5 },
    { key: 'Coherence & Cohesion', colour: '#f59e0b', width: 1.5 },
    { key: 'Lexical Resource', colour: '#8b5cf6', width: 1.5 },
    { key: 'Grammatical Range', colour: '#ef4444', width: 1.5 },
  ]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          label={{ value: 'Submission #', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
        />
        <YAxis domain={[0, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number, name: string) => [value?.toFixed(1), name]}
          labelFormatter={(label) => `Submission ${label}`}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {lines.map(({ key, colour, width }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colour}
            strokeWidth={width}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
