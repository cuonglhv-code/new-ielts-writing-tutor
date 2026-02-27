export type UserRole = 'student' | 'teacher'

export type Task1QuestionType =
  | 'bar_chart'
  | 'line_graph'
  | 'pie_chart'
  | 'table'
  | 'process'
  | 'map'
  | 'mixed'

export type Task2QuestionType =
  | 'opinion'
  | 'discussion'
  | 'advantages_disadvantages'
  | 'problem_solution'
  | 'double_question'
  | 'mixed'

export type QuestionType = Task1QuestionType | Task2QuestionType

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
  question_type?: QuestionType | null
  image_url?: string | null
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

// Rich per-criterion detail returned by updated Claude prompt
export interface CriterionDetail {
  band: number
  strengths: string[]
  strengths_vi?: string[]
  improvements: string[]
  improvements_vi?: string[]
}

export interface AssessmentCriteriaDetail {
  task_achievement: CriterionDetail
  coherence_cohesion: CriterionDetail
  lexical_resource: CriterionDetail
  grammatical_range: CriterionDetail
}

export interface ModelImprovements {
  revised_intro?: string
  revised_sentence_examples?: string[]
}

// Full rich assessment stored in submissions.assessment (jsonb)
export interface Assessment {
  overall_band: number
  band_scores: BandScores
  feedback: Feedback
  feedback_vi?: Feedback
  criteria_detail: AssessmentCriteriaDetail
  strengths: string[]
  strengths_vi?: string[]
  areas_for_improvement: string[]
  areas_for_improvement_vi?: string[]
  examiner_comment: string
  examiner_comment_vi?: string
  next_steps: string[]
  next_steps_vi?: string[]
  model_improvements?: ModelImprovements
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
  assessment?: Assessment | null
  submitted_at: string
  questions?: Question
}

export interface Tip {
  id: string
  category: string
  title: string
  content: string
  source_url?: string | null
  source_title?: string | null
  task_filter?: number | null  // 1 = Task 1, 2 = Task 2, null = both
  topic_tag?: string | null
  created_at: string
}
