'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function addQuestionToLesson(formData: FormData) {
  const supabase = createClient()
  const lesson_id = formData.get('lesson_id') as string
  const question_id = formData.get('question_id') as string

  if (!lesson_id || !question_id) {
    throw new Error('Lesson ID and Question ID are required.')
  }

  const { error } = await supabase
    .from('lesson_questions')
    .insert([{ lesson_id, question_id }])

  if (error) {
    console.error('Error adding question to lesson:', error)
    throw new Error('Failed to add question.')
  }

  // Need to get the path segments to revalidate
  const { data: lesson } = await supabase.from('lessons').select('modules(course_id, id)').eq('id', lesson_id).single()
  // @ts-ignore
  const courseId = lesson?.modules.course_id
  // @ts-ignore
  const moduleId = lesson?.modules.id
  
  if(courseId && moduleId){
    revalidatePath(`/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lesson_id}`)
  }
}

export async function removeQuestionFromLesson(formData: FormData) {
    const supabase = createClient()
    const lesson_id = formData.get('lesson_id') as string
    const question_id = formData.get('question_id') as string

    if (!lesson_id || !question_id) {
        throw new Error('Lesson ID and Question ID are required.')
    }

    const { error } = await supabase
        .from('lesson_questions')
        .delete()
        .eq('lesson_id', lesson_id)
        .eq('question_id', question_id)

    if (error) {
        console.error('Error removing question from lesson:', error)
        throw new Error('Failed to remove question.')
    }

    // Need to get the path segments to revalidate
    const { data: lesson } = await supabase.from('lessons').select('modules(course_id, id)').eq('id', lesson_id).single()
    // @ts-ignore
    const courseId = lesson?.modules.course_id
    // @ts-ignore
    const moduleId = lesson?.modules.id
    
    if(courseId && moduleId){
      revalidatePath(`/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lesson_id}`)
    }
}
