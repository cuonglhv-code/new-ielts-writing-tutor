import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import BandBadge, { BandScoreCard } from '@/components/ui/BandBadge'
import { formatDateTime, countWords } from '@/lib/utils'
import type { Assessment, CriterionDetail } from '@/lib/types'

interface Props {
  params: { id: string }
}

const CRITERIA = [
  {
    key: 'task_achievement',
    label: 'Task Achievement / Task Response',
    label_vi: 'Task Achievement / Phản hồi nhiệm vụ',
  },
  {
    key: 'coherence_cohesion',
    label: 'Coherence and Cohesion',
    label_vi: 'Coherence and Cohesion — Mạch lạc & Liên kết',
  },
  {
    key: 'lexical_resource',
    label: 'Lexical Resource',
    label_vi: 'Lexical Resource — Vốn từ vựng',
  },
  {
    key: 'grammatical_range',
    label: 'Grammatical Range and Accuracy',
    label_vi: 'Grammatical Range and Accuracy — Ngữ pháp',
  },
] as const

// ── Criterion card ────────────────────────────────────────────────────────────
function CriterionCard({
  label,
  labelVi,
  detail,
  feedback,
  feedbackVi,
}: {
  label: string
  labelVi: string
  detail?: CriterionDetail
  feedback?: string
  feedbackVi?: string
}) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
          <p className="text-xs text-gray-400">{labelVi}</p>
        </div>
        {detail && <BandBadge score={detail.band} size="sm" />}
      </div>

      {/* Feedback text — two columns if Vietnamese available */}
      {(feedback || feedbackVi) && (
        <div className={`grid gap-3 mb-4 ${feedbackVi ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {feedback && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">English</p>
              <p className="text-xs text-gray-700 leading-relaxed">{feedback}</p>
            </div>
          )}
          {feedbackVi && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">Tiếng Việt</p>
              <p className="text-xs text-indigo-800 leading-relaxed">{feedbackVi}</p>
            </div>
          )}
        </div>
      )}

      {/* Strengths & improvements — two columns per language */}
      {detail && (
        <div className="space-y-3">
          {/* Strengths row */}
          {detail.strengths.length > 0 && (
            <div className={`grid gap-3 ${detail.strengths_vi?.length ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1.5">&#10003; What you did well</p>
                <ul className="space-y-1">
                  {detail.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-700 flex gap-1.5">
                      <span className="flex-shrink-0 mt-0.5">&bull;</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {detail.strengths_vi && detail.strengths_vi.length > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-xs font-semibold text-emerald-700 mb-1.5">&#10003; Điểm bạn làm tốt</p>
                  <ul className="space-y-1">
                    {detail.strengths_vi.map((s, i) => (
                      <li key={i} className="text-xs text-emerald-700 flex gap-1.5">
                        <span className="flex-shrink-0 mt-0.5">&bull;</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Improvements row */}
          {detail.improvements.length > 0 && (
            <div className={`grid gap-3 ${detail.improvements_vi?.length ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1.5">&#8599; To improve</p>
                <ul className="space-y-1">
                  {detail.improvements.map((s, i) => (
                    <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                      <span className="flex-shrink-0 mt-0.5">&bull;</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {detail.improvements_vi && detail.improvements_vi.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1.5">&#8599; Cần cải thiện</p>
                  <ul className="space-y-1">
                    {detail.improvements_vi.map((s, i) => (
                      <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                        <span className="flex-shrink-0 mt-0.5">&bull;</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const QUESTION_TYPE_LABEL: Record<string, string> = {
  bar_chart: 'Bar chart', line_graph: 'Line graph', pie_chart: 'Pie chart',
  table: 'Table', process: 'Process diagram', map: 'Map',
  opinion: 'Opinion essay', discussion: 'Discussion essay',
  advantages_disadvantages: 'Advantages & Disadvantages',
  problem_solution: 'Problem & Solution', double_question: 'Double question',
  mixed: 'Mixed',
}

export default async function SubmissionPage({ params }: Props) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  if (!profile?.full_name) redirect('/onboarding')

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*, questions(*)')
    .eq('id', params.id)
    .single()

  if (error || !submission) notFound()

  if (profile.role === 'student' && submission.student_id !== user.id) {
    redirect('/dashboard')
  }

  const { band_scores, feedback, overall_band } = submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = submission as any
  const assessment: Assessment | null = sub.assessment ?? null

  const strengths: string[]       = assessment?.strengths              ?? sub.strengths              ?? []
  const strengths_vi: string[]    = assessment?.strengths_vi           ?? []
  const improvements: string[]    = assessment?.areas_for_improvement  ?? sub.areas_for_improvement  ?? []
  const improvements_vi: string[] = assessment?.areas_for_improvement_vi ?? []
  const examinerComment           = assessment?.examiner_comment        ?? sub.examiner_comment        ?? ''
  const examinerCommentVi         = assessment?.examiner_comment_vi     ?? ''
  const nextSteps: string[]       = assessment?.next_steps              ?? []
  const nextStepsVi: string[]     = assessment?.next_steps_vi           ?? []
  const modelImprovements         = assessment?.model_improvements      ?? null
  const criteriaDetail            = assessment?.criteria_detail         ?? null
  const feedbackVi                = assessment?.feedback_vi             ?? null
  const question                  = sub.questions

  const wordCount = countWords(submission.essay_text)
  const hasVietnamese = !!(examinerCommentVi || strengths_vi.length || improvements_vi.length)

  return (
    <>
      <Navbar role={profile.role} fullName={profile.full_name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={profile.role === 'teacher' ? '/teacher' : '/dashboard'}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          &#8592; Quay lại {profile.role === 'teacher' ? 'danh sách học sinh' : 'bảng điều khiển'}
        </Link>

        {/* Header card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge bg-indigo-100 text-indigo-700">
                  {question?.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                </span>
                {question?.question_type && (
                  <span className="badge bg-violet-100 text-violet-700">
                    {QUESTION_TYPE_LABEL[question.question_type] ?? question.question_type}
                  </span>
                )}
                <span className="badge bg-gray-100 text-gray-600">{question?.topic}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{question?.question_text}</p>
              <p className="text-xs text-gray-400 mt-2">
                Nộp lúc {formatDateTime(submission.submitted_at)} &middot; {wordCount} từ
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <p className="text-xs font-medium text-gray-500 mb-1">Band tổng thể</p>
              <div className="text-5xl font-bold text-indigo-600">{overall_band?.toFixed(1)}</div>
              <BandBadge score={overall_band} size="sm" showLabel className="mt-2" />
            </div>
          </div>
        </div>

        {/* Band score grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <BandScoreCard label="Task Achievement"     score={band_scores?.task_achievement} />
          <BandScoreCard label="Coherence & Cohesion" score={band_scores?.coherence_cohesion} />
          <BandScoreCard label="Lexical Resource"     score={band_scores?.lexical_resource} />
          <BandScoreCard label="Grammatical Range"    score={band_scores?.grammatical_range} />
        </div>

        {/* Examiner comment — bilingual */}
        {examinerComment && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Nhận xét tổng thể của giám khảo</h2>
            <div className={`rounded-xl border border-indigo-100 overflow-hidden ${hasVietnamese ? '' : 'bg-indigo-50'}`}>
              {examinerCommentVi ? (
                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-indigo-100">
                  <div className="bg-indigo-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 mb-2">English</p>
                    <p className="text-sm text-indigo-800 leading-relaxed">{examinerComment}</p>
                  </div>
                  <div className="bg-indigo-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 mb-2">Tiếng Việt</p>
                    <p className="text-sm text-indigo-800 leading-relaxed">{examinerCommentVi}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50 p-4">
                  <p className="text-sm text-indigo-800 leading-relaxed">{examinerComment}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Strengths & Improvements — bilingual */}
        {(strengths.length > 0 || improvements.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {strengths.length > 0 && (
              <div className="card p-5 bg-emerald-50 border-emerald-100">
                <h3 className="text-sm font-semibold text-emerald-800 mb-3">&#10003; Điểm mạnh tổng thể</h3>
                {strengths_vi.length > 0 ? (
                  <div className="space-y-2">
                    {strengths.map((s, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <p className="text-emerald-700 flex gap-1.5">
                          <span className="flex-shrink-0">&bull;</span>
                          <span>{s}</span>
                        </p>
                        {strengths_vi[i] && (
                          <p className="text-emerald-600 flex gap-1.5 pl-3 italic">
                            <span className="flex-shrink-0">&bull;</span>
                            <span>{strengths_vi[i]}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex gap-2">
                        <span className="flex-shrink-0 mt-0.5">&bull;</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {improvements.length > 0 && (
              <div className="card p-5 bg-amber-50 border-amber-100">
                <h3 className="text-sm font-semibold text-amber-800 mb-3">&#8599; Ưu tiên cải thiện</h3>
                {improvements_vi.length > 0 ? (
                  <div className="space-y-2">
                    {improvements.map((s, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <p className="text-amber-700 flex gap-1.5">
                          <span className="flex-shrink-0">&bull;</span>
                          <span>{s}</span>
                        </p>
                        {improvements_vi[i] && (
                          <p className="text-amber-600 flex gap-1.5 pl-3 italic">
                            <span className="flex-shrink-0">&bull;</span>
                            <span>{improvements_vi[i]}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {improvements.map((s, i) => (
                      <li key={i} className="text-sm text-amber-700 flex gap-2">
                        <span className="flex-shrink-0 mt-0.5">&bull;</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Next steps — bilingual */}
        {nextSteps.length > 0 && (
          <div className="card p-6 mb-6 bg-sky-50 border-sky-100">
            <h2 className="text-sm font-semibold text-sky-900 mb-3">
              Bước tiếp theo của bạn
            </h2>
            {nextStepsVi.length > 0 ? (
              <ol className="space-y-3">
                {nextSteps.map((step, i) => (
                  <li key={i} className="text-xs">
                    <div className="flex gap-3 text-sky-800 mb-0.5">
                      <span className="flex-shrink-0 font-semibold text-sky-600">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                    {nextStepsVi[i] && (
                      <div className="flex gap-3 text-sky-700 pl-4 italic">
                        <span className="flex-shrink-0 text-sky-400">{i + 1}.</span>
                        <span>{nextStepsVi[i]}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="space-y-2">
                {nextSteps.map((step, i) => (
                  <li key={i} className="text-sm text-sky-800 flex gap-3">
                    <span className="flex-shrink-0 font-semibold text-sky-600">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Detailed per-criterion feedback */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Phản hồi chi tiết theo tiêu chí</h2>
          <div className="space-y-6">
            {CRITERIA.map(({ key, label, label_vi }) => (
              <CriterionCard
                key={key}
                label={label}
                labelVi={label_vi}
                detail={criteriaDetail?.[key]}
                feedback={feedback?.[key as keyof typeof feedback]}
                feedbackVi={feedbackVi?.[key as keyof typeof feedbackVi] ?? undefined}
              />
            ))}
          </div>
        </div>

        {/* Model improvements — English only (students need accurate English models) */}
        {modelImprovements &&
          (modelImprovements.revised_intro ||
            (modelImprovements.revised_sentence_examples?.length ?? 0) > 0) && (
          <div className="card p-6 mb-6 border-violet-100 bg-violet-50">
            <h2 className="text-base font-semibold text-violet-900 mb-1">
              &#9998; Gợi ý cải thiện bài viết
            </h2>
            <p className="text-xs text-violet-500 mb-4">
              Những gợi ý này dựa trên bài viết của bạn — không phải bài mẫu hoàn chỉnh. Giữ nguyên bằng tiếng Anh để bạn luyện tập ngôn ngữ chính xác.
            </p>
            {modelImprovements.revised_intro && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-violet-700 mb-2">Mở bài được cải thiện</p>
                <div className="bg-white rounded-lg border border-violet-200 p-4 text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{modelImprovements.revised_intro}&rdquo;
                </div>
              </div>
            )}
            {(modelImprovements.revised_sentence_examples?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-violet-700 mb-2">Câu văn được cải thiện</p>
                <ul className="space-y-2">
                  {modelImprovements.revised_sentence_examples!.map((ex, i) => (
                    <li key={i} className="bg-white rounded-lg border border-violet-200 p-3 text-sm text-gray-700 italic">
                      &ldquo;{ex}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Task 1 image */}
        {question?.image_url && question?.task_type === 'task1' && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Hình ảnh Task 1</h2>
            <Image
              src={question.image_url}
              alt="Task 1 chart or diagram"
              width={800}
              height={500}
              className="rounded-lg border border-gray-200 w-full h-auto"
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Essay */}
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Bài viết của bạn</h2>
          <p className="text-xs text-gray-400 mb-3">{wordCount} từ</p>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border border-gray-100">
            {submission.essay_text}
          </div>
        </div>

        {profile.role === 'student' && (
          <div className="flex gap-3">
            <Link href="/practice" className="btn-primary">Luyện tập tiếp &#8594;</Link>
            <Link href="/dashboard" className="btn-secondary">Xem bảng điều khiển</Link>
          </div>
        )}
      </main>
    </>
  )
}
