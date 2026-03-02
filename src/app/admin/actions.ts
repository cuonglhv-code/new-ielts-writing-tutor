'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addQuestion(formData: FormData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const taskType = formData.get('task_type') as string
    const topic = formData.get('topic') as string
    const difficulty = formData.get('difficulty') as string
    const questionText = formData.get('question_text') as string

    if (!questionText || !topic) return { error: 'Missing fields' }

    const { error } = await supabase.from('questions').insert({
        task_type: taskType,
        topic,
        difficulty,
        question_text: questionText,
        question_type: taskType === 'task1' ? 'mixed' : 'opinion', // Simplified default
    })

    if (error) return { error: error.message }

    revalidatePath('/practice')
    return { success: true }
}

export async function addTip(formData: FormData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const category = formData.get('category') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const topicTag = formData.get('topic_tag') as string

    if (!title || !content) return { error: 'Missing fields' }

    const { error } = await supabase.from('tips').insert({
        category,
        title,
        content,
        topic_tag: topicTag,
        source_title: 'Admin Upload'
    })

    if (error) return { error: error.message }

    revalidatePath('/tips')
    return { success: true }
}
