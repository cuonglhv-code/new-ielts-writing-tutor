'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCourse(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create a course.')
  }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title) {
    throw new Error('Title is required.')
  }

  const { error } = await supabase
    .from('courses')
    .insert([{ title, description }])

  if (error) {
    console.error('Error creating course:', error)
    // You might want to handle this error more gracefully
    throw new Error('Failed to create course.')
  }

  revalidatePath('/teacher/courses')
  redirect('/teacher/courses')
}
