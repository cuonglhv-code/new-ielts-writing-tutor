'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createModule(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create a module.')
  }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const course_id = formData.get('course_id') as string

  if (!title || !course_id) {
    throw new Error('Title and course ID are required.')
  }

  // Get current module count to set the order
  const { count, error: countError } = await supabase
    .from('modules')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', course_id)

  if (countError) {
    console.error('Error getting module count:', countError)
    throw new Error('Failed to determine module order.')
  }

  const module_order = (count ?? 0) + 1

  const { error } = await supabase
    .from('modules')
    .insert([{ title, description, course_id, module_order }])

  if (error) {
    console.error('Error creating module:', error)
    throw new Error('Failed to create module.')
  }

  revalidatePath(`/teacher/courses/${course_id}`)
  redirect(`/teacher/courses/${course_id}`)
}
