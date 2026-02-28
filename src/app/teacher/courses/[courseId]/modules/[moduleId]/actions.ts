'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createLesson(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create a lesson.')
  }
  
  const title = formData.get('title') as string
  const lesson_type = formData.get('lesson_type') as string
  const content = formData.get('content') as string
  const module_id = formData.get('module_id') as string
  const course_id = formData.get('course_id') as string

  if (!title || !lesson_type || !module_id) {
    throw new Error('Title, lesson type, and module ID are required.')
  }

  // Get current lesson count to set the order
  const { count, error: countError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('module_id', module_id)

  if (countError) {
    console.error('Error getting lesson count:', countError)
    throw new Error('Failed to determine lesson order.')
  }

  const lesson_order = (count ?? 0) + 1

  const { error } = await supabase
    .from('lessons')
    .insert([{ title, lesson_type, content, module_id, lesson_order }])

  if (error) {
    console.error('Error creating lesson:', error)
    throw new Error('Failed to create lesson.')
  }

  revalidatePath(`/teacher/courses/${course_id}/modules/${module_id}`)
  redirect(`/teacher/courses/${course_id}/modules/${module_id}`)
}
