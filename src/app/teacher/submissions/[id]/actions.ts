'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function saveAssessment(formData: FormData) {
  const supabase = createClient()

  const submissionId = formData.get('submission_id') as string
  const task_achievement = parseFloat(formData.get('task_achievement') as string)
  const coherence_cohesion = parseFloat(formData.get('coherence_cohesion') as string)
  const lexical_resource = parseFloat(formData.get('lexical_resource') as string)
  const grammatical_range = parseFloat(formData.get('grammatical_range') as string)
  const feedback = formData.get('feedback') as string

  const overall_band = (task_achievement + coherence_cohesion + lexical_resource + grammatical_range) / 4

  const { error } = await supabase
    .from('submissions')
    .update({
      band_scores: {
        task_achievement,
        coherence_cohesion,
        lexical_resource,
        grammatical_range,
      },
      feedback: {
        task_achievement: '',
        coherence_cohesion: '',
        lexical_resource: '',
        grammatical_range: '',
        overall: feedback,
      },
      overall_band,
    })
    .eq('id', submissionId)

  if (error) {
    console.error('Error saving assessment:', error)
    // Optionally handle the error
  }

  revalidatePath('/teacher/submissions')
  redirect('/teacher/submissions')
}
