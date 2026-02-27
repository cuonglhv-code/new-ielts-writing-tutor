import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

interface BandCriterion {
  keyPhrase?: string
  upgradeTo6?: string[]
  upgradeTo7?: string[]
  upgradeTo8?: string[]
  upgradeTo9?: string[]
  maintain?: string[]
}

interface BandData {
  summary?: string
  criteria?: Record<string, BandCriterion>
}

interface TipBundle {
  id: string
  label: string
  taskTarget?: string
  bandTarget?: string
  tips: string[]
}

interface TaskData {
  id: string
  label: string
  bands?: Record<string, BandData>
  tipBundles?: TipBundle[]
}

interface GuideData {
  tasks: TaskData[]
}

interface TipRow {
  category: string
  title: string
  content: string
  source_url: string | null
  source_title: string
  task_filter: number | null
  topic_tag: string
}

const SOURCE_TITLE = 'IELTS Writing Tips & Band Guide (IELTS-Writing-Guide.md)'
const GUIDE_PATH = path.join(process.cwd(), 'IELTS-Writing-Guide.md')
const DRY_RUN = process.argv.includes('--dry-run')

function loadEnvFromLocalFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const idx = line.indexOf('=')
    if (idx < 1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && value) process.env[key] = value
  }
}

function extractGuideJson(markdown: string): GuideData {
  const match = markdown.match(/## JSON Data for the App\s+```json\s*([\s\S]*?)\s*```/)
  if (!match?.[1]) {
    throw new Error('Could not find JSON block under "## JSON Data for the App".')
  }

  const parsed = JSON.parse(match[1]) as GuideData
  if (!parsed?.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
    throw new Error('Guide JSON is missing a valid tasks array.')
  }
  return parsed
}

function getTaskMeta(taskId: string): { taskFilter: number | null; category: string } {
  if (taskId === 'task1') return { taskFilter: 1, category: 'Task 1 Structure' }
  if (taskId === 'task2') return { taskFilter: 2, category: 'Task 2 Argument Development' }
  return { taskFilter: null, category: 'Grammar' }
}

function inferTopicTag(labelOrId: string): string {
  const text = labelOrId.toLowerCase()
  if (text.includes('time') || text.includes('planning')) return 'time'
  if (text.includes('cohesion') || text.includes('coherence')) return 'coherence'
  if (text.includes('lexis') || text.includes('vocab') || text.includes('language')) return 'vocabulary'
  if (text.includes('grammar')) return 'grammar'
  if (text.includes('argument') || text.includes('response') || text.includes('task')) return 'task_achievement'
  return 'structure'
}

function toBulletLines(items: string[] | undefined): string[] {
  if (!items || items.length === 0) return []
  return items.map((item) => `- ${item}`)
}

function buildBandTip(task: TaskData, band: string, bandData: BandData, category: string, taskFilter: number | null): TipRow {
  const criteria = bandData.criteria ?? {}
  const lines: string[] = []

  if (bandData.summary) lines.push(`**Band Summary:** ${bandData.summary}`)

  for (const [criterion, detail] of Object.entries(criteria)) {
    lines.push('')
    lines.push(`**${criterion}**`)
    if (detail.keyPhrase) lines.push(`- Expectation: ${detail.keyPhrase}`)

    const upgrades = [
      ...(detail.upgradeTo6 ?? []),
      ...(detail.upgradeTo7 ?? []),
      ...(detail.upgradeTo8 ?? []),
      ...(detail.upgradeTo9 ?? []),
      ...(detail.maintain ?? []),
    ]

    if (upgrades.length > 0) {
      lines.push('- Next moves:')
      lines.push(...toBulletLines(upgrades))
    }
  }

  return {
    category,
    title: `${task.label} - Band ${band}`,
    content: lines.join('\n').trim(),
    source_url: null,
    source_title: SOURCE_TITLE,
    task_filter: taskFilter,
    topic_tag: 'task_achievement',
  }
}

function buildBundleTip(task: TaskData, bundle: TipBundle, category: string, taskFilter: number | null): TipRow {
  const lines: string[] = []

  if (bundle.bandTarget) lines.push(`**Target Band Range:** ${bundle.bandTarget}`)
  lines.push('**Action Steps:**')
  lines.push(...toBulletLines(bundle.tips))

  return {
    category,
    title: `${task.label} - ${bundle.label}`,
    content: lines.join('\n'),
    source_url: null,
    source_title: SOURCE_TITLE,
    task_filter: taskFilter,
    topic_tag: inferTopicTag(`${bundle.id} ${bundle.label}`),
  }
}

function buildTips(data: GuideData): TipRow[] {
  const rows: TipRow[] = []

  for (const task of data.tasks) {
    const { taskFilter, category } = getTaskMeta(task.id)

    const orderedBands = Object.keys(task.bands ?? {}).sort((a, b) => Number(a) - Number(b))
    for (const band of orderedBands) {
      rows.push(buildBandTip(task, band, (task.bands ?? {})[band], category, taskFilter))
    }

    for (const bundle of task.tipBundles ?? []) {
      rows.push(buildBundleTip(task, bundle, category, taskFilter))
    }
  }

  return rows
}

async function upsertByTitle(supabase: any, tip: TipRow): Promise<'inserted' | 'updated' | 'failed'> {
  const { data: existing, error: findError } = await supabase
    .from('tips')
    .select('id')
    .eq('title', tip.title)
    .limit(1)

  if (findError) {
    console.error(`Find failed for "${tip.title}": ${findError.message}`)
    return 'failed'
  }

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from('tips')
      .update({
        category: tip.category,
        content: tip.content,
        source_url: tip.source_url,
        source_title: tip.source_title,
        task_filter: tip.task_filter,
        topic_tag: tip.topic_tag,
      })
      .eq('id', existing[0].id)

    if (error) {
      console.error(`Update failed for "${tip.title}": ${error.message}`)
      return 'failed'
    }
    return 'updated'
  }

  const { error } = await supabase.from('tips').insert(tip)
  if (error) {
    console.error(`Insert failed for "${tip.title}": ${error.message}`)
    return 'failed'
  }
  return 'inserted'
}

async function main() {
  if (!fs.existsSync(GUIDE_PATH)) {
    throw new Error(`Guide file not found: ${GUIDE_PATH}`)
  }

  const markdown = fs.readFileSync(GUIDE_PATH, 'utf8')
  const guideData = extractGuideJson(markdown)
  const tips = buildTips(guideData)

  console.log(`Prepared ${tips.length} tips from IELTS-Writing-Guide.md`)

  if (DRY_RUN) {
    console.log('Dry run mode enabled. No database writes performed.')
    for (const tip of tips.slice(0, 5)) {
      console.log(`- ${tip.title}`)
    }
    return
  }

  loadEnvFromLocalFile()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  let inserted = 0
  let updated = 0
  let failed = 0

  for (const tip of tips) {
    const result = await upsertByTitle(supabase, tip)
    if (result === 'inserted') inserted += 1
    if (result === 'updated') updated += 1
    if (result === 'failed') failed += 1
  }

  console.log('')
  console.log('Import summary')
  console.log(`- Inserted: ${inserted}`)
  console.log(`- Updated: ${updated}`)
  console.log(`- Failed: ${failed}`)
}

main().catch((error) => {
  console.error(`Fatal error: ${(error as Error).message}`)
  process.exit(1)
})
