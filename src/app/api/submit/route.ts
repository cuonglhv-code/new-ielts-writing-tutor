import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { calcOverallBand, countWords } from '@/lib/utils'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a certified IELTS examiner with extensive experience assessing Writing tasks. Evaluate the submitted essay strictly according to the four official IELTS Writing Band Descriptors.

Assess the essay on these four criteria:
1. Task Achievement / Task Response — How well the writer addresses all parts of the task
2. Coherence and Cohesion — Logical organisation, paragraphing, and cohesive devices
3. Lexical Resource — Range and accuracy of vocabulary
4. Grammatical Range and Accuracy — Variety and accuracy of grammatical structures

Rules:
- Band scores are given in 0.5 increments from 1.0 to 9.0
- Be strict and honest; do not inflate scores
- The overall_band is the mean of the four scores, rounded to the nearest 0.5
- Provide detailed, actionable feedback for each criterion (3–5 sentences each)
- Identify 2–3 genuine strengths
- Identify 2–3 specific, prioritised areas for improvement
- Write an examiner_comment as a brief holistic summary (2–3 sentences)

You MUST respond with ONLY a valid JSON object in exactly this format — no markdown, no additional text:
{
  "band_scores": {
    "task_achievement": <number>,
    "coherence_cohesion": <number>,
    "lexical_resource": <number>,
    "grammatical_range": <number>
  },
  "overall_band": <number>,
  "feedback": {
    "task_achievement": "<string>",
    "coherence_cohesion": "<string>",
    "lexical_resource": "<string>",
    "grammatical_range": "<string>"
  },
  "strengths": ["<string>", "<string>"],
  "areas_for_improvement": ["<string>", "<string>"],
  "examiner_comment": "<string>"
}`

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { questionId, essayText } = body

    if (!questionId || !essayText?.trim()) {
      return NextResponse.json(
        { error: 'Missing question ID or essay text.' },
        { status: 400 }
      )
    }

    const wordCount = countWords(essayText)
    if (wordCount < 50) {
      return NextResponse.json(
        { error: 'Essay is too short to assess. Please write at least 50 words.' },
        { status: 400 }
      )
    }

    // 3. Fetch the question
    const adminClient = createAdminClient()
    const { data: question, error: qError } = await adminClient
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (qError || !question) {
      return NextResponse.json({ error: 'Question not found.' }, { status: 404 })
    }

    // 4. Call Claude API
    const taskLabel =
      question.task_type === 'task1' ? 'IELTS Writing Task 1' : 'IELTS Writing Task 2'

    const userMessage = `Task type: ${taskLabel}

Question:
${question.question_text}

Candidate's essay (${wordCount} words):
${essayText}`

    let claudeResponse: string
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      })

      claudeResponse =
        message.content[0].type === 'text' ? message.content[0].text : ''
    } catch (apiError) {
      console.error('Claude API error:', apiError)
      return NextResponse.json(
        {
          error:
            'The AI examiner is temporarily unavailable. Please try again in a moment.',
        },
        { status: 503 }
      )
    }

    // 5. Parse JSON response
    let assessment
    try {
      // Strip any accidental markdown code fences
      const cleaned = claudeResponse
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim()
      assessment = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse Claude response:', claudeResponse)
      return NextResponse.json(
        {
          error:
            'The AI returned an unexpected format. Please try again.',
        },
        { status: 500 }
      )
    }

    // 6. Validate and recalculate overall band
    const { band_scores, feedback, strengths, areas_for_improvement, examiner_comment } =
      assessment
    const overallBand = calcOverallBand(band_scores)

    // 7. Save submission using admin client (service role bypasses RLS)
    const { data: submission, error: insertError } = await adminClient
      .from('submissions')
      .insert({
        student_id: user.id,
        question_id: questionId,
        essay_text: essayText,
        band_scores,
        feedback,
        overall_band: overallBand,
        strengths,
        areas_for_improvement,
        examiner_comment,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save your submission. Please try again.' },
        { status: 500 }
      )
    }

    // 8. Return result
    return NextResponse.json({
      submissionId: submission.id,
      band_scores,
      overall_band: overallBand,
      feedback,
      strengths,
      areas_for_improvement,
      examiner_comment,
    })
  } catch (err) {
    console.error('Unexpected error in /api/submit:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
