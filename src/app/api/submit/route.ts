import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { calcOverallBand, countWords } from '@/lib/utils'
import type { Assessment } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a certified IELTS examiner with extensive experience assessing Writing tasks. Evaluate the submitted essay strictly according to the four official IELTS Writing Band Descriptors.

Assess the essay on these four criteria:
1. Task Achievement / Task Response -- How well the writer addresses all parts of the task
2. Coherence and Cohesion -- Logical organisation, paragraphing, and cohesive devices
3. Lexical Resource -- Range and accuracy of vocabulary
4. Grammatical Range and Accuracy -- Variety and accuracy of grammatical structures

Rules:
- Band scores are given in 0.5 increments from 1.0 to 9.0
- Be strict and honest; do not inflate scores
- Provide 3-5 sentences of holistic feedback per criterion in "feedback"
- For each criterion in "criteria_detail", give 2-3 specific strengths and 2-3 specific improvements (short, punchy bullet phrases)
- Identify 2-3 overall strengths (holistic, cross-criterion)
- Identify 2-3 prioritised areas for improvement (holistic)
- Write next_steps as 3 concrete, actionable steps the student can take immediately
- Write examiner_comment as a brief holistic summary (2-3 sentences)
- In model_improvements, optionally provide a revised introduction and 1-3 improved sentence examples drawn from the essay
- Never invent content or data not present in the essay; never provide a full model essay
- Feedback tone must be professional, neutral, and encouraging

You MUST respond with ONLY a valid JSON object in exactly this format -- no markdown, no extra text:
{
  "overall_band": <number>,
  "band_scores": {
    "task_achievement": <number>,
    "coherence_cohesion": <number>,
    "lexical_resource": <number>,
    "grammatical_range": <number>
  },
  "feedback": {
    "task_achievement": "<3-5 sentence string>",
    "coherence_cohesion": "<3-5 sentence string>",
    "lexical_resource": "<3-5 sentence string>",
    "grammatical_range": "<3-5 sentence string>"
  },
  "criteria_detail": {
    "task_achievement": {
      "band": <number>,
      "strengths": ["<string>", "<string>"],
      "improvements": ["<string>", "<string>"]
    },
    "coherence_cohesion": {
      "band": <number>,
      "strengths": ["<string>", "<string>"],
      "improvements": ["<string>", "<string>"]
    },
    "lexical_resource": {
      "band": <number>,
      "strengths": ["<string>", "<string>"],
      "improvements": ["<string>", "<string>"]
    },
    "grammatical_range": {
      "band": <number>,
      "strengths": ["<string>", "<string>"],
      "improvements": ["<string>", "<string>"]
    }
  },
  "strengths": ["<string>", "<string>"],
  "areas_for_improvement": ["<string>", "<string>"],
  "examiner_comment": "<string>",
  "next_steps": ["<step 1>", "<step 2>", "<step 3>"],
  "model_improvements": {
    "revised_intro": "<optional improved version of the introduction paragraph>",
    "revised_sentence_examples": ["<improved sentence 1>", "<improved sentence 2>"]
  }
}`

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

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

    const adminClient = createAdminClient()
    const { data: question, error: qError } = await adminClient
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (qError || !question) {
      return NextResponse.json({ error: 'Question not found.' }, { status: 404 })
    }

    const taskLabel =
      question.task_type === 'task1' ? 'IELTS Writing Task 1' : 'IELTS Writing Task 2'

    let userMessage = `Task type: ${taskLabel}
Question type: ${question.question_type ?? 'general'}

Question:
${question.question_text}`

    if (question.task_type === 'task1' && question.image_url) {
      userMessage += `\n\n[Note: This task includes a visual (chart/diagram). Assess Task Achievement based on how well the candidate describes and interprets data. Do not invent specific data values not present in the essay -- focus on language quality if data accuracy cannot be verified.]`
    }

    userMessage += `\n\nCandidate's essay (${wordCount} words):\n${essayText}`

    let claudeResponse: string
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      })

      claudeResponse =
        message.content[0].type === 'text' ? message.content[0].text : ''
    } catch (apiError) {
      console.error('Claude API error:', apiError)
      return NextResponse.json(
        { error: 'The AI examiner is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    let raw: Assessment
    try {
      const cleaned = claudeResponse
        .replace(/\`\`\`json\s*/gi, '')
        .replace(/\`\`\`\s*/gi, '')
        .trim()
      raw = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse Claude response:', claudeResponse)
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 }
      )
    }

    const {
      band_scores,
      feedback,
      criteria_detail,
      strengths,
      areas_for_improvement,
      examiner_comment,
      next_steps,
      model_improvements,
    } = raw

    const overallBand = calcOverallBand(band_scores)

    const assessment: Assessment = {
      overall_band: overallBand,
      band_scores,
      feedback,
      criteria_detail,
      strengths: strengths ?? [],
      areas_for_improvement: areas_for_improvement ?? [],
      examiner_comment: examiner_comment ?? '',
      next_steps: next_steps ?? [],
      model_improvements: model_improvements ?? {},
    }

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
        assessment,
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

    return NextResponse.json({
      submissionId: submission.id,
      overall_band: overallBand,
      band_scores,
      feedback,
      criteria_detail,
      strengths,
      areas_for_improvement,
      examiner_comment,
      next_steps,
      model_improvements,
    })
  } catch (err) {
    console.error('Unexpected error in /api/submit:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
