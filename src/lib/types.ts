export type UserRole = 'student' | 'teacher'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string | null
  age: number | null
  band_target: number | null
  study_hours: number | null
  background: string | null
  created_at: string
}

export interface Question {
  id: string
  task_type: 'task1' | 'task2'
  topic: string
  difficulty: 'Band 5-6' | 'Band 6-7' | 'Band 7-8'
  question_text: string
  created_at: string
}

export interface BandScores {
  task_achievement: number
  coherence_cohesion: number
  lexical_resource: number
  grammatical_range: number
}

export interface Feedback {
  task_achievement: string
  coherence_cohesion: string
  lexical_resource: string
  grammatical_range: string
}

export interface AssessmentResult {
  band_scores: BandScores
  overall_band: number
  feedback: Feedback
  strengths: string[]
  areas_for_improvement: string[]
  examiner_comment: string
}

export interface Submission {
  id: string
  student_id: string
  question_id: string
  essay_text: string
  band_scores: BandScores
  feedback: Feedback
  overall_band: number
  strengths?: string[]
  areas_for_improvement?: string[]
  examiner_comment?: string
  submitted_at: string
  questions?: Question
}

export interface Tip {
  id: string
  category: string
  title: string
  content: string
  created_at: string
}
