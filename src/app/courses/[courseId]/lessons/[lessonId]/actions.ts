'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function completeLesson(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const lessonId = formData.get('lesson_id') as string
  const courseId = formData.get('course_id') as string

  if (!lessonId || !courseId) {
    return redirect(`/courses`)
  }

  const { error } = await supabase.from('lesson_completions').insert({
    user_id: user.id,
    lesson_id: lessonId,
  })

  if (error) {
    console.error('Error marking lesson as complete:', error)
    // Optionally handle the error, e.g., show a message to the user
  }

  revalidatePath(`/courses/${courseId}`)
  redirect(`/courses/${courseId}`)
}
