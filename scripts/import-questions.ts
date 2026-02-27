/**
 * Jaxtina IELTS v2 — Question Bank Importer
 *
 * Reads all Writing .docx files from the "Question bank" folder,
 * extracts Task 1 / Task 2 questions + embedded images, and
 * inserts them into Supabase.
 *
 * Run with:  npm run import-questions
 *
 * Prerequisites:
 *   1. Create a public Supabase Storage bucket named "question-images"
 *      (Dashboard → Storage → New bucket, tick Public)
 *   2. Set these env vars in .env.local (or export them):
 *        NEXT_PUBLIC_SUPABASE_URL
 *        SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import mammoth from 'mammoth'

// ── Load env vars ─────────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  // Split on LF or CRLF so Windows line endings are handled correctly
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const eqIdx = line.indexOf('=')
    if (eqIdx < 1) continue
    const key = line.slice(0, eqIdx).trim()
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && val) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Constants ─────────────────────────────────────────────────────────────────
const QUESTION_BANK = path.join(process.cwd(), 'Question bank')
const BUCKET = 'question-images'

type Difficulty = 'Band 5-6' | 'Band 6-7' | 'Band 7-8'
type TaskType   = 'task1' | 'task2'

// ── Difficulty by course folder ───────────────────────────────────────────────
function getDifficulty(filePath: string): Difficulty {
  if (filePath.includes('/NEW/') || filePath.includes('\\NEW\\')) return 'Band 7-8'
  if (filePath.includes('INP'))  return 'Band 7-8'
  if (filePath.includes('IF1'))  return 'Band 5-6'
  // IF2, FOP, [FOP] Practice Tests
  return 'Band 6-7'
}

// ── Topic extraction ──────────────────────────────────────────────────────────
const TOPIC_MAP: Record<string, string> = {
  family:        'Society',
  community:     'Society',
  communication: 'Society',
  culture:       'Society',
  society:       'Society',
  social:        'Society',
  urban:         'Society',
  city:          'Society',
  rural:         'Society',
  crime:         'Society',
  education:     'Education',
  learning:      'Education',
  student:       'Education',
  school:        'Education',
  university:    'Education',
  academic:      'Education',
  environment:   'Environment',
  climate:       'Environment',
  energy:        'Environment',
  pollution:     'Environment',
  recycl:        'Environment',
  wildlife:      'Environment',
  renewable:     'Environment',
  health:        'Health',
  medical:       'Health',
  medicine:      'Health',
  diet:          'Health',
  fitness:       'Health',
  obesity:       'Health',
  technology:    'Technology',
  internet:      'Technology',
  digital:       'Technology',
  computer:      'Technology',
  science:       'Technology',
  transport:     'Transport',
  traffic:       'Transport',
  travel:        'Transport',
  vehicle:       'Transport',
  aviation:      'Transport',
  economy:       'Economy',
  economic:      'Economy',
  trade:         'Economy',
  finance:       'Economy',
  business:      'Economy',
  employment:    'Economy',
  work:          'Economy',
  job:           'Economy',
}

function extractTopic(heading: string, questionText: string): string {
  const combined = (heading + ' ' + questionText).toLowerCase()
  for (const [keyword, topic] of Object.entries(TOPIC_MAP)) {
    if (combined.includes(keyword)) return topic
  }
  return 'Other'
}

// ── Question type detection ───────────────────────────────────────────────────
function detectTask1Type(text: string): string {
  const t = text.toLowerCase()
  let count = 0
  const types: string[] = []
  if (t.includes('bar chart') || t.includes('bar graph')) { types.push('bar_chart'); count++ }
  if (t.includes('line graph') || t.includes('line chart')) { types.push('line_graph'); count++ }
  if (t.includes('pie chart')) { types.push('pie_chart'); count++ }
  if (t.includes(' table ') || t.includes('the table')) { types.push('table'); count++ }
  if (t.includes('process') || t.includes('flow') || t.includes('how') && t.includes('produced')) { types.push('process'); count++ }
  if (t.includes(' map ') || t.includes('plan ') || t.includes('surroundings') || t.includes('layout')) { types.push('map'); count++ }
  if (t.includes('diagram')) { types.push('process'); count++ }
  if (count > 1) return 'mixed'
  return types[0] ?? 'mixed'
}

function detectTask2Type(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('advantages and disadvantages') || t.includes('advantages as well as disadvantages')) {
    return 'advantages_disadvantages'
  }
  if (t.includes('agree or disagree') || t.includes('to what extent do you agree') || t.includes('do you agree or disagree')) {
    return 'opinion'
  }
  if (t.includes('discuss both') || (t.includes('some people') && t.includes('others') && t.includes('discuss'))) {
    return 'discussion'
  }
  if ((t.includes('causes') || t.includes('problems') || t.includes('reasons')) &&
      (t.includes('solutions') || t.includes('effects') || t.includes('measures'))) {
    return 'problem_solution'
  }
  if (t.includes('causes') || t.includes('problems') || t.includes('effects') || t.includes('consequences')) {
    return 'problem_solution'
  }
  // Two separate questions
  const questionMarks = (text.match(/\?/g) ?? []).length
  if (questionMarks >= 2) return 'double_question'
  return 'mixed'
}

// ── Text cleanup ──────────────────────────────────────────────────────────────
const SEPARATOR_RE = /^[_…\s.]{10,}$/m  // lines of underscores or ellipses

function cleanQuestion(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => !SEPARATOR_RE.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Parse questions from raw text ─────────────────────────────────────────────
interface ParsedQuestion {
  task_type: TaskType
  question_text: string
  imageIndex?: number  // which image (0-based) to attach
}

function parseQuestions(text: string): ParsedQuestion[] {
  const results: ParsedQuestion[] = []

  // Normalise line endings
  const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Patterns that mark a task section
  const TASK1_RE = /^(?:WRITING\s+)?TASK\s+1\b/im
  const TASK2_RE = /^(?:WRITING\s+)?TASK\s+2\b/im

  const task1Match = TASK1_RE.exec(t)
  const task2Match = TASK2_RE.exec(t)

  if (task1Match) {
    const start = task1Match.index
    const end   = task2Match ? task2Match.index : t.length
    const block = t.slice(start, end)
    const q = extractTaskBlock(block, 'task1')
    if (q) results.push({ task_type: 'task1', question_text: q, imageIndex: 0 })
  }

  if (task2Match) {
    const block = t.slice(task2Match.index)
    const q = extractTaskBlock(block, 'task2')
    if (q) results.push({ task_type: 'task2', question_text: q })
  }

  // If neither marker found, try the FOP/IF2 style (no "TASK N" header, just straight question)
  if (results.length === 0) {
    const has150 = /write at least 150 words/i.test(t)
    const has250 = /write at least 250 words/i.test(t)

    if (has150) {
      const q = extractFlatBlock(t, 'task1')
      if (q) results.push({ task_type: 'task1', question_text: q, imageIndex: 0 })
    }
    if (has250) {
      const q = extractFlatBlock(t, 'task2')
      if (q) results.push({ task_type: 'task2', question_text: q })
    }
  }

  return results
}

function extractTaskBlock(block: string, taskType: TaskType): string | null {
  // Remove the task header line itself
  const lines = block.split('\n').map(l => l.trim())

  // Find the end marker: line of underscores/dots, or word-limit line
  const endRe   = taskType === 'task1'
    ? /write at least 1[5-9]0 words/i
    : /write at least 2[5-9]0 words/i
  const sepRe   = /^[_…\s.]{10,}$/

  let start = 0
  let end   = lines.length

  // Skip the first header line
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:WRITING\s+)?TASK\s+[12]\b/i.test(lines[i])) { start = i + 1; break }
  }

  for (let i = start; i < lines.length; i++) {
    if (sepRe.test(lines[i]) && i > start + 2) { end = i; break }
    if (endRe.test(lines[i])) { end = i + 1; break }
  }

  const q = lines.slice(start, end)
    .filter(l => !sepRe.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return q.length > 30 ? q : null
}

function extractFlatBlock(text: string, taskType: TaskType): string | null {
  const endRe = taskType === 'task1'
    ? /write at least 1[5-9]0 words/i
    : /write at least 2[5-9]0 words/i
  const lines = text.split('\n').map(l => l.trim())
  const sepRe = /^[_…\s.]{10,}$/

  let end = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (sepRe.test(lines[i]) && i > 2) { end = i; break }
    if (endRe.test(lines[i])) { end = i + 1; break }
  }

  // Skip leading unit title lines
  let start = 0
  for (let i = 0; i < Math.min(5, end); i++) {
    if (/^(LESSON|UNIT)\s+\d+/i.test(lines[i])) { start = i + 1; break }
  }

  const q = lines.slice(start, end)
    .filter(l => !sepRe.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return q.length > 30 ? q : null
}

// ── Image extraction ──────────────────────────────────────────────────────────
interface ExtractedImage {
  buffer: Buffer
  contentType: string
  ext: string
}

async function extractImages(filePath: string): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = []

  await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read('base64').then((base64) => {
          const contentType = image.contentType ?? 'image/png'
          const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png'
          images.push({
            buffer: Buffer.from(base64, 'base64'),
            contentType,
            ext,
          })
          return { src: '' }  // placeholder — we don't use the HTML
        })
      }),
    }
  )

  return images
}

// ── Upload image to Supabase Storage ─────────────────────────────────────────
async function uploadImage(img: ExtractedImage, name: string): Promise<string | null> {
  const fileName = `${name}.${img.ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, img.buffer, {
      contentType: img.contentType,
      upsert: true,
    })

  if (error) {
    console.warn(`    ⚠  Image upload failed for ${fileName}:`, error.message)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

// ── Extract heading from document text ───────────────────────────────────────
function extractHeading(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  // Look for a UNIT/LESSON line in the first 10 lines
  for (const l of lines.slice(0, 10)) {
    const m = l.match(/^(?:UNIT|LESSON)\s+\d+[:\-–\s]+(.+)/i)
    if (m) return m[1].trim()
    // JAXTINA IELTS EXAMINATION → skip
    if (/JAXTINA|WRITING TEST|INSTRUCTIONS/i.test(l)) continue
    if (l.length > 4 && l.length < 60 && /^[A-Z]/.test(l)) return l
  }
  return ''
}

// ── Collect all writing docx files ───────────────────────────────────────────
function findWritingFiles(): string[] {
  const results: string[] = []

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.isFile() && entry.name.endsWith('.docx') && !entry.name.startsWith('~$')) {
        const name = entry.name.toLowerCase()
        // Only pick files explicitly about Writing, or the NEW test files
        if (name.includes('writing') || full.includes('\\NEW\\') || full.includes('/NEW/')) {
          results.push(full)
        }
      }
    }
  }

  walk(QUESTION_BANK)
  return results
}

// ── Deduplicate: check if question already exists ─────────────────────────────
async function questionExists(questionText: string): Promise<boolean> {
  // Use first 200 chars as a fingerprint
  const fingerprint = questionText.slice(0, 200).trim()
  const { data } = await supabase
    .from('questions')
    .select('id')
    .ilike('question_text', `${fingerprint.slice(0, 50)}%`)
    .limit(1)
  return (data?.length ?? 0) > 0
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔍  Scanning Question bank folder…')
  const files = findWritingFiles()
  console.log(`    Found ${files.length} Writing docx files\n`)

  let inserted = 0
  let skipped  = 0
  let failed   = 0

  for (const filePath of files) {
    const relPath = path.relative(QUESTION_BANK, filePath)
    console.log(`📄  ${relPath}`)

    try {
      // Extract raw text
      const { value: rawText } = await mammoth.extractRawText({ path: filePath })
      const heading = extractHeading(rawText)

      // Parse question blocks
      const parsed = parseQuestions(rawText)
      if (parsed.length === 0) {
        console.log('    ⚪ No writing questions found — skipping')
        continue
      }

      // Extract images (only needed if Task 1 present)
      const hasTask1 = parsed.some(p => p.task_type === 'task1')
      let images: ExtractedImage[] = []
      if (hasTask1) {
        images = await extractImages(filePath)
      }

      const difficulty  = getDifficulty(filePath)
      const baseSlug    = relPath.replace(/[^\w]/g, '_').slice(0, 60)

      for (const { task_type, question_text, imageIndex } of parsed) {
        const cleanText = cleanQuestion(question_text)
        if (cleanText.length < 30) {
          console.log(`    ⚪ Task ${task_type} text too short — skipping`)
          continue
        }

        // Skip if already in DB
        if (await questionExists(cleanText)) {
          console.log(`    ⚠  Task ${task_type} already exists — skipping`)
          skipped++
          continue
        }

        const topic      = extractTopic(heading, cleanText)
        const questionType = task_type === 'task1'
          ? detectTask1Type(cleanText)
          : detectTask2Type(cleanText)

        // Upload image if applicable
        let imageUrl: string | null = null
        if (task_type === 'task1' && typeof imageIndex === 'number' && images[imageIndex]) {
          const imageName = `${baseSlug}_t1_${imageIndex}_${Date.now()}`
          imageUrl = await uploadImage(images[imageIndex], imageName)
          if (imageUrl) console.log(`    🖼  Image uploaded`)
        }

        // Insert question
        const { error } = await supabase.from('questions').insert({
          task_type,
          topic,
          difficulty,
          question_text: cleanText,
          question_type: questionType,
          image_url: imageUrl,
        })

        if (error) {
          console.error(`    ❌  Insert failed:`, error.message)
          failed++
        } else {
          console.log(`    ✅  Inserted ${task_type} — ${topic} — ${questionType} — ${difficulty}`)
          inserted++
        }
      }
    } catch (err) {
      console.error(`    ❌  Error processing file:`, (err as Error).message)
      failed++
    }
  }

  console.log('\n── Summary ───────────────────────────────')
  console.log(`  Inserted : ${inserted}`)
  console.log(`  Skipped  : ${skipped}`)
  console.log(`  Failed   : ${failed}`)
  console.log('─────────────────────────────────────────\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
