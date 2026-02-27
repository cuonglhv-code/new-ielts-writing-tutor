import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const taskType = searchParams.get('task_type')
  const topic = searchParams.get('topic')
  const difficulty = searchParams.get('difficulty')

  let query = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (taskType) query = query.eq('task_type', taskType)
  if (topic) query = query.eq('topic', topic)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ questions: data })
}
