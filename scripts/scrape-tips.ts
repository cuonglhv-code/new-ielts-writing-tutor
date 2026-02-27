/**
 * Jaxtina IELTS v2 — Writing Tips Scraper
 *
 * Scrapes IELTS Writing tips from public sites (robots.txt-aware).
 * Inserts into the Supabase tips table with source attribution.
 *
 * Run with:  npm run scrape-tips
 *
 * Note: ielts.idp.com has a crawl-delay of 3600s — we respect this by
 * linking to those pages instead of copying their content.
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

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
  console.error('❌  Missing env vars. Check .env.local.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Types ─────────────────────────────────────────────────────────────────────
interface TipToInsert {
  category: string
  title: string
  content: string
  source_url: string
  source_title: string
  task_filter: number | null   // 1 | 2 | null
  topic_tag: string
}

// ── Fetch with rate limiting ──────────────────────────────────────────────────
async function fetchHtml(url: string, delayMs = 2000): Promise<string | null> {
  await new Promise(r => setTimeout(r, delayMs))
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JaxtinaBot/1.0; educational use)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      console.warn(`    ⚠  ${res.status} for ${url}`)
      return null
    }
    return await res.text()
  } catch (err) {
    console.warn(`    ⚠  Fetch failed: ${(err as Error).message}`)
    return null
  }
}

// ── Check robots.txt ──────────────────────────────────────────────────────────
async function isScrapingAllowed(baseUrl: string): Promise<{ allowed: boolean; crawlDelay: number }> {
  const robotsUrl = `${baseUrl}/robots.txt`
  const html = await fetchHtml(robotsUrl, 1000)
  if (!html) return { allowed: true, crawlDelay: 2 }

  let disallowed = false
  let crawlDelay = 2

  for (const line of html.split('\n')) {
    const l = line.trim().toLowerCase()
    if (l.startsWith('crawl-delay:')) {
      const d = parseInt(l.split(':')[1].trim())
      if (!isNaN(d)) crawlDelay = Math.max(crawlDelay, d)
    }
    if (l.startsWith('disallow: /') && !l.includes('disallow: /*')) {
      // Only block if the root is disallowed
    }
    if (l === 'disallow: /') disallowed = true
  }

  // ielts.idp.com has crawl-delay 3600 — too slow for automated scraping
  if (crawlDelay >= 3600) {
    return { allowed: false, crawlDelay }
  }

  return { allowed: !disallowed, crawlDelay }
}

// ── Text cleaning ─────────────────────────────────────────────────────────────
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── IELTSLIZ.COM scraper ──────────────────────────────────────────────────────
const IELTSLIZ_PAGES = [
  // Task 1
  { url: 'https://ieltsliz.com/ielts-writing-task-1-tips/', task: 1, topic: 'task_achievement', title: 'IELTS Writing Task 1 Tips' },
  { url: 'https://ieltsliz.com/ielts-writing-task-1-overview/', task: 1, topic: 'task_achievement', title: 'Writing Task 1: How to Write an Overview' },
  { url: 'https://ieltsliz.com/how-to-describe-trends-ielts-writing-task-1/', task: 1, topic: 'vocabulary', title: 'Vocabulary for Describing Trends (Task 1)' },
  // Task 2
  { url: 'https://ieltsliz.com/ielts-writing-task-2-tips/', task: 2, topic: 'structure', title: 'IELTS Writing Task 2 Tips' },
  { url: 'https://ieltsliz.com/ielts-writing-task-2-introduction/', task: 2, topic: 'structure', title: 'How to Write a Task 2 Introduction' },
  { url: 'https://ieltsliz.com/ielts-writing-task-2-body-paragraphs/', task: 2, topic: 'coherence', title: 'Writing Body Paragraphs for Task 2' },
  // Vocabulary & Grammar
  { url: 'https://ieltsliz.com/ielts-vocabulary/', task: null as null, topic: 'vocabulary', title: 'IELTS Vocabulary Guide' },
  { url: 'https://ieltsliz.com/ielts-grammar/', task: null as null, topic: 'grammar', title: 'IELTS Grammar Tips' },
]

async function scrapeIeltsLiz(delayMs: number): Promise<TipToInsert[]> {
  const tips: TipToInsert[] = []

  for (const page of IELTSLIZ_PAGES) {
    console.log(`    Fetching: ${page.url}`)
    const html = await fetchHtml(page.url, delayMs * 1000)
    if (!html) continue

    const $ = cheerio.load(html)

    // IeltsLiz uses .entry-content for main content
    const content = $('.entry-content, .post-content, article .content, main article')
    if (!content.length) {
      console.warn(`      ⚠  Could not find content on ${page.url}`)
      continue
    }

    // Extract key headings + their paragraphs as individual tips
    const sections: string[] = []

    content.find('h2, h3').each((_, el) => {
      const heading = $(el).text().trim()
      if (!heading || heading.length < 5) return

      let bodyParts: string[] = []
      let sibling = $(el).next()
      while (sibling.length && !sibling.is('h2, h3')) {
        const text = sibling.text().trim()
        if (text.length > 20) bodyParts.push(text)
        sibling = sibling.next()
      }

      if (bodyParts.length > 0) {
        const body = bodyParts.join('\n').slice(0, 1200)
        sections.push(`**${heading}**\n${body}`)
      }
    })

    if (sections.length === 0) {
      // Fallback: grab first 800 chars of main text
      const text = cleanText(content.text()).slice(0, 800)
      if (text.length > 100) {
        sections.push(text)
      }
    }

    if (sections.length > 0) {
      // Combine all sections into one tip per page
      const content_text = sections.slice(0, 6).join('\n\n')
      tips.push({
        category:     getCategoryFromTopic(page.topic, page.task),
        title:        page.title,
        content:      content_text.slice(0, 3000),
        source_url:   page.url,
        source_title: `ieltsliz.com — ${page.title}`,
        task_filter:  page.task,
        topic_tag:    page.topic,
      })
      console.log(`      ✅  Extracted tip: ${page.title}`)
    }
  }

  return tips
}

// ── IELTS-SIMON scraper ───────────────────────────────────────────────────────
const IELTS_SIMON_PAGES = [
  { url: 'https://ielts-simon.study/ielts-writing-task-1/', task: 1 as number | null, topic: 'structure', title: 'Writing Task 1 Lesson Notes (Simon)' },
  { url: 'https://ielts-simon.study/ielts-writing-task-2/', task: 2 as number | null, topic: 'structure', title: 'Writing Task 2 Lesson Notes (Simon)' },
]

async function scrapeIeltsSimon(delayMs: number): Promise<TipToInsert[]> {
  const tips: TipToInsert[] = []

  for (const page of IELTS_SIMON_PAGES) {
    console.log(`    Fetching: ${page.url}`)
    const html = await fetchHtml(page.url, delayMs * 1000)
    if (!html) continue

    const $ = cheerio.load(html)

    const mainContent = $('main, .entry-content, article, .content, #content').first()
    if (!mainContent.length) continue

    const sections: string[] = []

    mainContent.find('h2, h3, h4').each((_, el) => {
      const heading = $(el).text().trim()
      if (!heading || heading.length < 5) return

      let bodyParts: string[] = []
      let sibling = $(el).next()
      while (sibling.length && !sibling.is('h2, h3, h4')) {
        const text = sibling.text().trim()
        if (text.length > 10) bodyParts.push(text)
        sibling = sibling.next()
      }

      if (bodyParts.length > 0) {
        sections.push(`**${heading}**\n${bodyParts.join('\n').slice(0, 600)}`)
      }
    })

    if (sections.length === 0) {
      const text = cleanText(mainContent.text()).slice(0, 800)
      if (text.length > 100) sections.push(text)
    }

    if (sections.length > 0) {
      tips.push({
        category:     getCategoryFromTopic(page.topic, page.task),
        title:        page.title,
        content:      sections.slice(0, 5).join('\n\n').slice(0, 3000),
        source_url:   page.url,
        source_title: `ielts-simon.study — ${page.title}`,
        task_filter:  page.task,
        topic_tag:    page.topic,
      })
      console.log(`      ✅  Extracted tip: ${page.title}`)
    }
  }

  return tips
}

// ── IDP — link-only (crawl-delay too high) ────────────────────────────────────
function getIdpLinkTips(): TipToInsert[] {
  // These pages cannot be scraped (3600s crawl-delay) — stored as link-only tips
  return [
    {
      category:     'Task 1 Structure',
      title:        'IELTS Writing Task 1 — Official IDP Guide',
      content:      'Visit the official IDP IELTS website for authoritative guidance on Writing Task 1, including band descriptors, sample answers, and examiner tips.\n\n☑ Understand the 4 official assessment criteria\n☑ See annotated sample Task 1 answers at different band levels\n☑ Read the official examiner tips on overview, key features, and comparisons',
      source_url:   'https://ielts.idp.com/prepare/article-ielts-writing-task-one-tips',
      source_title: 'ielts.idp.com — IELTS Writing Task 1 Tips',
      task_filter:  1,
      topic_tag:    'task_achievement',
    },
    {
      category:     'Task 2 Argument Development',
      title:        'IELTS Writing Task 2 — Official IDP Guide',
      content:      'The official IDP IELTS website provides detailed guidance on Writing Task 2, including how examiners score your response and what makes a Band 7+ essay.\n\n☑ Understand what "Task Response" means to examiners\n☑ Learn how to structure an opinion essay vs. a discussion essay\n☑ Review annotated sample essays at Band 6, 7, and 8',
      source_url:   'https://ielts.idp.com/prepare/article-ielts-writing-task-two-tips',
      source_title: 'ielts.idp.com — IELTS Writing Task 2 Tips',
      task_filter:  2,
      topic_tag:    'task_achievement',
    },
    {
      category:     'Grammar',
      title:        'IELTS Band Descriptors — Official IDP Scoring Guide',
      content:      'IDP provides the official IELTS Writing band descriptors explaining exactly what examiners look for across all 4 criteria at each band level.\n\n☑ Coherence and Cohesion: paragraphing, signposting, reference\n☑ Lexical Resource: range, precision, collocation, word formation\n☑ Grammatical Range and Accuracy: sentence forms, error frequency',
      source_url:   'https://ielts.idp.com/prepare/article-ielts-writing-band-score',
      source_title: 'ielts.idp.com — IELTS Writing Band Score Guide',
      task_filter:  null,
      topic_tag:    'grammar',
    },
  ]
}

// ── Category helper ───────────────────────────────────────────────────────────
function getCategoryFromTopic(topic: string, task: number | null): string {
  if (task === 1) return 'Task 1 Structure'
  if (topic === 'vocabulary') return 'Vocabulary'
  if (topic === 'grammar')    return 'Grammar'
  if (topic === 'coherence')  return 'Task 2 Argument Development'
  return 'Task 2 Argument Development'
}

// ── Insert tips (skip duplicates) ─────────────────────────────────────────────
async function insertTip(tip: TipToInsert): Promise<boolean> {
  // Check if a tip with the same title already exists
  const { data } = await supabase
    .from('tips')
    .select('id')
    .eq('title', tip.title)
    .limit(1)

  if ((data?.length ?? 0) > 0) {
    console.log(`    ⚠  Already exists: ${tip.title}`)
    return false
  }

  const { error } = await supabase.from('tips').insert(tip)
  if (error) {
    console.error(`    ❌  Insert failed: ${error.message}`)
    return false
  }
  return true
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  let inserted = 0
  let skipped  = 0

  // 1. IDP — link-only tips (no scraping needed)
  console.log('\n📌  Adding IDP link-only tips (crawl-delay too high to scrape)…')
  for (const tip of getIdpLinkTips()) {
    const ok = await insertTip(tip)
    ok ? inserted++ : skipped++
  }

  // 2. ieltsliz.com
  console.log('\n🌐  Checking ieltsliz.com robots.txt…')
  const lizRobots = await isScrapingAllowed('https://ieltsliz.com')
  if (lizRobots.allowed) {
    console.log(`    ✅  Scraping allowed (delay: ${lizRobots.crawlDelay}s)`)
    const tips = await scrapeIeltsLiz(lizRobots.crawlDelay)
    for (const tip of tips) {
      const ok = await insertTip(tip)
      ok ? inserted++ : skipped++
    }
  } else {
    console.log(`    ⚠  Scraping not allowed or crawl-delay too high — skipping`)
  }

  // 3. ielts-simon.study
  console.log('\n🌐  Checking ielts-simon.study robots.txt…')
  const simonRobots = await isScrapingAllowed('https://ielts-simon.study')
  if (simonRobots.allowed) {
    console.log(`    ✅  Scraping allowed (delay: ${simonRobots.crawlDelay}s)`)
    const tips = await scrapeIeltsSimon(simonRobots.crawlDelay)
    for (const tip of tips) {
      const ok = await insertTip(tip)
      ok ? inserted++ : skipped++
    }
  } else {
    console.log(`    ⚠  Scraping not allowed or crawl-delay too high — skipping`)
  }

  console.log('\n── Summary ───────────────────────────────')
  console.log(`  Inserted : ${inserted}`)
  console.log(`  Skipped  : ${skipped}`)
  console.log('─────────────────────────────────────────\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
