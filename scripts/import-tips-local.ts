/**
 * Jaxtina IELTS v2 - Local Tips Importer
 *
 * Imports curated IELTS Writing tips extracted from:
 * "The Complete Solution IELTS Writing" - ZIM IELTS Academy (2020)
 *
 * Run with:  npm run import-tips
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load env vars
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
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
  console.error('Missing env vars. Check .env.local.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

interface TipToInsert {
  category:     string
  title:        string
  content:      string
  source_url:   string | null
  source_title: string
  task_filter:  number | null
  topic_tag:    string
}

const SOURCE = 'ZIM IELTS Academy - The Complete Solution IELTS Writing (2020)'

const TIPS: TipToInsert[] = [

  // ─── TASK 1: STRUCTURE ──────────────────────────────────────────────────────

  {
    category: 'Task 1 Structure',
    title: 'Task 1: General Rules & Time Management',
    task_filter: 1,
    topic_tag: 'task_achievement',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Time: Maximum 20 minutes**\n' +
      'Task 1 is worth only 1/3 of your Writing score. Task 2 is worth 2/3, so manage your time carefully.\n\n' +
      '**Word count: 150-200 words**\n' +
      'You must write at least 150 words. Aim for 170-200 - writing much more wastes time without adding marks.\n\n' +
      '**Key rules:**\n' +
      '- Do NOT give your personal opinion or include information not shown in the chart.\n' +
      '- SELECT the most important features - do not list every single data point.\n' +
      '- COMPARE and contrast where relevant (e.g., highest vs. lowest, biggest change).\n' +
      '- Vary your vocabulary and sentence structures to score higher on Lexical Resource and Grammar.\n\n' +
      '**4-step process:**\n' +
      '1. Analyse the chart (identify subject, unit, time period)\n' +
      '2. Write the Introduction (paraphrase the question)\n' +
      '3. Write the Overview (2 most notable features)\n' +
      '4. Write the Details (2 body paragraphs with specific data)',
  },

  {
    category: 'Task 1 Structure',
    title: 'Task 1: How to Write the Introduction',
    task_filter: 1,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Rule:** Paraphrase the question - do NOT copy it word for word.\n\n' +
      '**Useful sentence starters:**\n' +
      '- The chart/graph/table **illustrates** / **describes** / **demonstrates**...\n' +
      '- The diagram **shows** / **presents** / **compares**...\n' +
      '- The pie charts **compare** the proportion of...\n\n' +
      '**What to include:**\n' +
      '- What the visual shows (subject)\n' +
      '- The unit of measurement (%, thousands, etc.)\n' +
      '- The time period (if given)\n\n' +
      '**Examples:**\n' +
      '- "The line graph **illustrates** changes in the number of cars per household in Great Britain over a period of 40 years."\n' +
      '- "The bar chart **describes** the proportion of males and females participating in popular sports in Britain in 2008."\n' +
      '- "The table **illustrates** the share of expenditure for three categories in five countries in 2002."\n\n' +
      '**Paraphrasing tools:**\n' +
      '- chart / graph / figure / diagram / visual\n' +
      '- shows / illustrates / presents / describes / demonstrates / compares\n' +
      '- between 1990 and 2010 / over a 20-year period / from 1990 to 2010',
  },

  {
    category: 'Task 1 Structure',
    title: 'Task 1: How to Write the Overview',
    task_filter: 1,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**The Overview is the most important paragraph in Task 1.**\n' +
      'It summarises the 2-3 most striking features WITHOUT specific numbers.\n\n' +
      '**Useful starters:**\n' +
      '- "Overall, it is clear that..."\n' +
      '- "In general, it can be seen that..."\n' +
      '- "It is noticeable that..."\n' +
      '- "As an overview..."\n\n' +
      '**What to include:**\n' +
      '- The biggest trend (which category is highest/lowest overall)\n' +
      '- The most significant change (which item changed the most)\n' +
      '- Any striking contrast between categories\n\n' +
      '**Examples:**\n' +
      '- "Overall, it is clear that while the percentages of one-car and two-car households increased, the opposite is true for no-car households."\n' +
      '- "In general, Nuclear was by far the most popular source of electricity production over the period."\n' +
      '- "As can be seen from the plans, the health centre witnessed dramatic changes both outdoors and indoors."\n\n' +
      '**Common mistake:** Writing the Overview with specific numbers - save all data for the Detail paragraphs.',
  },

  {
    category: 'Task 1 Structure',
    title: 'Task 1: The 4-Step Method for Any Chart Type',
    task_filter: 1,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Step 1: Analyse**\n' +
      'Identify: subject, unit (%, millions, tonnes?), time period, number of categories, and the most notable features.\n\n' +
      '**Step 2: Introduction**\n' +
      'Paraphrase the question. State what the chart shows without copying the words.\n\n' +
      '**Step 3: Overview**\n' +
      'Write 2-3 sentences on the most striking features. No specific numbers here.\n\n' +
      '**Step 4: Details (2 paragraphs)**\n' +
      'Group related information logically:\n' +
      '- Line/bar charts: group by time period OR by category\n' +
      '- Pie charts: group highest values together, lowest together\n' +
      '- Maps: group by location (north/south, inside/outside building)\n' +
      '- Processes: describe each stage in sequence\n\n' +
      '**Linking words for processes:**\n' +
      'First / Initially -> After that / Then / Subsequently / Following this -> Finally / At the last stage\n\n' +
      '**Linking words for comparisons:**\n' +
      'In contrast / On the other hand / Meanwhile / Whereas / While / Similarly / Likewise',
  },

  // ─── VOCABULARY ─────────────────────────────────────────────────────────────

  {
    category: 'Vocabulary',
    title: 'Trend Vocabulary: Verbs & Nouns (Task 1)',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Upward trends (increase):**\n' +
      '- Verbs: increase, rise, grow, go up, climb, surge, soar, rocket\n' +
      '- Nouns: an increase, a rise, growth, an upward trend\n\n' +
      '**Downward trends (decrease):**\n' +
      '- Verbs: decrease, decline, fall, drop, plunge, dip\n' +
      '- Nouns: a decrease, a decline, a fall, a drop, a downward trend\n\n' +
      '**Stable / No change:**\n' +
      '- Verbs: remain stable, stay unchanged, level off, stabilise, plateau\n' +
      '- Nouns: stability, a plateau\n\n' +
      '**Fluctuation:**\n' +
      '- Verbs: fluctuate, vary\n' +
      '- Nouns: a fluctuation, variation\n\n' +
      '**Peak and Trough:**\n' +
      '- Reach a peak / hit the highest point / peak at [value]\n' +
      '- Hit a low / hit the lowest point / reach a trough / bottom out\n\n' +
      '**Example sentences:**\n' +
      '- "The number of students **rose steadily** from 1,500 to 2,000."\n' +
      '- "Sales **fluctuated** throughout the period before **levelling off** at $3 million."\n' +
      '- "Electricity production from nuclear **peaked at** nearly 430 TWh in 2005."',
  },

  {
    category: 'Vocabulary',
    title: 'Rate of Change: Adjectives & Adverbs (Task 1)',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Small / gradual change:**\n' +
      '- Adjectives: slight, marginal, moderate, gradual, slow, steady\n' +
      '- Adverbs: slightly, marginally, moderately, gradually, slowly, steadily\n\n' +
      '**Large / fast change:**\n' +
      '- Adjectives: considerable, significant, substantial, dramatic, sharp, rapid, steep\n' +
      '- Adverbs: considerably, significantly, substantially, dramatically, sharply, rapidly\n\n' +
      '**Usage patterns:**\n' +
      '- Verb + adverb: "Sales **increased significantly**."\n' +
      '- There + was + article + adj + noun: "There was a **significant increase** in sales."\n' +
      '- Subject + experienced/witnessed + noun: "Sales **witnessed a dramatic rise**."\n\n' +
      '**Examples:**\n' +
      '- "The unemployment rate **fell slightly** from 8% to 7.5%."\n' +
      '- "There was a **dramatic surge** in online shopping between 2010 and 2020."\n' +
      '- "The figure for renewable energy **rose steadily** over the decade."\n' +
      '- "Exports **dropped sharply** by $2 million in 2008."',
  },

  {
    category: 'Vocabulary',
    title: 'Prepositions with Data: at / to / by / of',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**at** - state a fixed value or level:\n' +
      '- stand at: "The crime rate **stood at** 5% in 2000."\n' +
      '- remain stable at: "Exports **remained stable at** $15 million."\n' +
      '- peak at: "Production **peaked at** 10,000 units."\n\n' +
      '**to** - show the end value after a change:\n' +
      '- increase/decrease to: "Students **increased to** 10,000 after two years."\n' +
      '- There was an increase **to** 10,000 in student numbers.\n\n' +
      '**by** - show the amount of change:\n' +
      '- increase/decrease by: "Sales **increased by** 2,000 units." (change = 2,000)\n\n' +
      '**of** - use with nouns to show the amount of change, or peak/trough value:\n' +
      '- an increase/decrease of: "There was an increase **of** 2,000 in student numbers."\n' +
      '- reach a peak of: "Production **reached a peak of** 10,000 units."\n' +
      '- hit a low of: "Exports **hit a low of** $1.5 million in 2009."\n\n' +
      '**Quick rule:**\n' +
      '- From 5,000 to 7,000: increased **by** 2,000 / increased **to** 7,000\n' +
      '- The highest value was 7,000: peaked **at** 7,000 / reached a peak **of** 7,000',
  },

  {
    category: 'Vocabulary',
    title: '5 Grammar Structures for Describing Data Changes',
    task_filter: 1,
    topic_tag: 'grammar',
    source_url: null,
    source_title: SOURCE,
    content:
      'Use these 5 structures to add variety. All describe the same data point.\n' +
      '**Data: Student numbers rose from 1,500 to 2,000 in 2016 (an increase of 500).**\n\n' +
      '**Structure 1** - Subject + Verb + Adverb + Number + Time:\n' +
      '"The number of students **increased significantly to 2,000 in 2016**."\n\n' +
      '**Structure 2** - There + be + Article + Adjective + Noun + Number + Time:\n' +
      '"There was **a significant increase of 500** in the number of students **in 2016**."\n\n' +
      '**Structure 3** - Subject + experienced/witnessed + Article + Adjective + Noun:\n' +
      '"The number of students **witnessed a significant increase of 500 in 2016**."\n\n' +
      '**Structure 4** - Article + Adjective + Noun + was seen + in Subject:\n' +
      '"**A significant increase of 500 was seen** in the number of students in 2016."\n\n' +
      '**Structure 5** - Time + witnessed + Article + Adjective + Noun + in Noun Phrase:\n' +
      '"**The year 2016 witnessed a significant increase of 500** in student numbers."\n\n' +
      '**Tip:** Rotate between these structures throughout your Task 1 response to improve your Grammar score.',
  },

  {
    category: 'Vocabulary',
    title: 'Comparison Language for Task 1',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Comparing two values at the same point:**\n' +
      '- "X was [value], **compared with** Y at [value]."\n' +
      '- "X accounted for [value], **while/whereas** Y made up [value]."\n' +
      '- "X was **twice as much as** Y." / "X was **half of** Y."\n' +
      '- "X was **significantly/slightly higher/lower than** Y."\n\n' +
      '**Replacing repeated nouns:**\n' +
      'Avoid repeating the same noun - use "the figure for X" or "that of X":\n' +
      '- "The unemployment rate in Vietnam was 10%, while **the figure for** the US was 12%."\n' +
      '- "Canada\'s housing expenditure was 14%, compared to **that of** the US at 26%."\n\n' +
      '**Expressing dominance:**\n' +
      '- "X was **by far the most** popular..."\n' +
      '- "X accounted for **the largest proportion** of..."\n\n' +
      '**Expressing similarity:**\n' +
      '- "The figures for X and Y were **relatively similar**, at around 6%."\n' +
      '- "Both X and Y experienced **comparable** trends."\n\n' +
      '**Example:**\n' +
      '"In 2008, approximately 25% of men played football, **compared with** only 5% of women. The figures for tennis were **relatively similar**, **at around** 6% for both sexes."',
  },

  {
    category: 'Vocabulary',
    title: 'Language for Maps & Location (Task 1)',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Describing location:**\n' +
      '- to the north/south/east/west of...\n' +
      '- in the north-eastern/south-western corner\n' +
      '- in the centre/middle of...\n' +
      '- on the left/right-hand side\n' +
      '- adjacent to / next to / beside / opposite\n' +
      '- between X and Y\n\n' +
      '**Describing changes to a map:**\n' +
      '- has been **constructed/built/added**\n' +
      '- has been **demolished/removed/knocked down**\n' +
      '- has been **converted into / transformed into**\n' +
      '- has been **extended/expanded/enlarged**\n' +
      '- has been **relocated to** the [direction]\n' +
      '- was **replaced by** a new [building]\n\n' +
      '**Paraphrasing map features:**\n' +
      '- countryside -> rural area\n' +
      '- shopping centre -> shopping mall / shopping complex\n' +
      '- housing -> accommodation / residential area\n' +
      '- pedestrians only -> pedestrian precinct\n' +
      '- bus station -> bus stop\n\n' +
      '**Map introduction formulas:**\n' +
      '- "The two maps describe a number of changes which took place in [place] between [year] and [year]."\n' +
      '- "The plan illustrates two possible locations/sites for a new [building] in [city]."',
  },

  // ─── TASK 2: ARGUMENT ───────────────────────────────────────────────────────

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: General Rules & Common Mistakes',
    task_filter: 2,
    topic_tag: 'task_achievement',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Time: 40 minutes | Words: minimum 250 (aim for 260-300)**\n' +
      'Task 2 is worth 2/3 of your Writing score - prioritise it.\n\n' +
      '**Key rules:**\n' +
      '- Do NOT use abbreviations (e.g., "govt" instead of "government").\n' +
      '- Do NOT use very informal language or slang.\n' +
      '- Do NOT copy sentences from the question - examiners will not count them.\n' +
      '- Write 4 paragraphs: Introduction + 2 Body paragraphs + Conclusion.\n' +
      '- Limit idiomatic expressions - they often sound unnatural.\n\n' +
      '**The audience is a general (non-specialist) reader.**\n' +
      'Topics are general: travel, health, education, environment, social issues, technology.\n\n' +
      '**You ARE expected to give your opinion** (in most question types).\n' +
      'You can use personal examples and relevant evidence to support your argument.\n\n' +
      '**Common mistakes:**\n' +
      '- Writing under 250 words - automatic score penalty\n' +
      '- Going off-topic - re-read the question before writing your conclusion\n' +
      '- Writing only one body paragraph - always write two\n' +
      '- Not stating a clear position in the introduction',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'The 5 Types of Task 2 Essay Questions',
    task_filter: 2,
    topic_tag: 'task_achievement',
    source_url: null,
    source_title: SOURCE,
    content:
      '**1. Opinion (Agree/Disagree)**\n' +
      'Question: "Do you agree or disagree?" or "To what extent do you agree or disagree?"\n' +
      'Strategy: State your position clearly and defend it throughout.\n' +
      'Example: "Everyone should stay at school until 18. To what extent do you agree?"\n\n' +
      '**2. Discussion (Both Views)**\n' +
      'Question: "Discuss both views and give your own opinion."\n' +
      'Strategy: Cover BOTH sides, then give your personal conclusion.\n\n' +
      '**3. Advantages & Disadvantages**\n' +
      'Question: "Do the advantages outweigh the disadvantages?" or "Is this a positive or negative development?"\n' +
      'Strategy: Weigh both sides; give a clear conclusion about which is greater.\n\n' +
      '**4. Cause & Solution (or Cause & Effect)**\n' +
      'Question: "What are the causes of this problem and what solutions can be suggested?"\n' +
      'Strategy: One paragraph on causes, one on solutions/effects.\n\n' +
      '**5. Direct Question (Two-Part)**\n' +
      'Question: Two separate questions about one topic.\n' +
      'Strategy: Answer BOTH questions - one per body paragraph.',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: 4-Paragraph Essay Structure',
    task_filter: 2,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Paragraph 1 - Introduction (2-3 sentences):**\n' +
      '- Sentence 1: Paraphrase the topic (introduce the issue)\n' +
      '- Sentence 2: State your position or say what you will discuss\n\n' +
      '**Paragraph 2 - Body Paragraph 1 (4-6 sentences):**\n' +
      '- Topic sentence: state the main idea of this paragraph\n' +
      '- Sub-idea 1 + supporting detail or example\n' +
      '- Sub-idea 2 + supporting detail or example\n\n' +
      '**Paragraph 3 - Body Paragraph 2 (4-6 sentences):**\n' +
      '- Topic sentence: the contrasting or second main idea\n' +
      '- Sub-idea 1 + supporting detail or example\n' +
      '- Sub-idea 2 + supporting detail or example\n\n' +
      '**Paragraph 4 - Conclusion (1-2 sentences):**\n' +
      '- Restate your position in different words\n' +
      '- Optionally summarise the key reasons\n\n' +
      '**PEEL structure for each body paragraph:**\n' +
      '- **P**oint: topic sentence (your claim)\n' +
      '- **E**xplain: why or how is this true?\n' +
      '- **E**vidence: example, data, or reason\n' +
      '- **L**ink: connect back to the essay question\n\n' +
      '**Example:**\n' +
      'Topic sentence: "On the one hand, playing video games has some advantages."\n' +
      'Support: "Firstly, games help players relax and improve work efficiency. This is especially important for students dealing with increasing workloads today."',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: How to Write the Introduction',
    task_filter: 2,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Purpose:** Introduce the topic and signal your position. Keep it to 2-3 sentences.\n\n' +
      '**Structure:**\n' +
      '1. Paraphrase the topic statement (do NOT copy it)\n' +
      '2. State your view or what you will discuss\n\n' +
      '**Example question:** "Government should invest more in science education. Do you agree or disagree?"\n\n' +
      '**Example introduction:**\n' +
      '"It is said that government funding should give preference to science-based subjects in an attempt to boost national development. Although an increase in scientific developments can have many benefits, **this essay disagrees that science is the primary contributor**." \n\n' +
      '**Useful phrases for stating your position:**\n' +
      '- "This essay **agrees/disagrees** that..."\n' +
      '- "I **strongly believe** that..." / "I **partially agree** that..."\n' +
      '- "**In my view,** the advantages of X **outweigh** the disadvantages."\n\n' +
      '**Useful phrases for discussion essays:**\n' +
      '- "There are compelling arguments on both sides of this debate."\n' +
      '- "This essay will discuss both perspectives before reaching a conclusion."\n\n' +
      '**Paraphrasing the topic:**\n' +
      '- government -> authorities / policymakers / the state\n' +
      '- invest -> allocate / spend / channel funding into\n' +
      '- important -> vital / crucial / essential / significant',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: How to Write the Conclusion',
    task_filter: 2,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Purpose:** Restate your position and summarise. Keep it to 1-2 sentences.\n\n' +
      '**Rule:** Do NOT introduce new ideas in the conclusion.\n\n' +
      '**Useful conclusion starters:**\n' +
      '- "In conclusion,..."\n' +
      '- "To conclude,..."\n' +
      '- "In summary,..."\n' +
      '- "To summarise,..."\n\n' +
      '**Examples:**\n' +
      '- "In conclusion, playing video games is both advantageous and disadvantageous. In my view, the extent to which each user is affected depends largely on how much time they spend on games."\n' +
      '- "To conclude, although science has led to many benefits, science alone is not the key contributor to national progress. Governments should invest equally across all subjects."\n' +
      '- "In summary, the disadvantages of video games outweigh the advantages for most players."\n\n' +
      '**Opinion essay:** Restate your original position in different words.\n' +
      '**Discussion essay:** State which view is more convincing and why.\n' +
      '**Advantages/Disadvantages:** State which side is greater overall.',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Paraphrasing Techniques for IELTS Writing',
    task_filter: null,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      'Paraphrasing is essential for the Introduction and for avoiding repetition throughout your essay.\n\n' +
      '**Technique 1 - Synonyms:**\n' +
      'Replace words with words of similar meaning.\n' +
      '- government -> authorities / policymakers / the state / national leaders\n' +
      '- support -> help / aid / assist / provide assistance for\n' +
      '- important -> vital / crucial / essential / significant\n' +
      '- local businesses -> local companies / small enterprises / domestic firms\n\n' +
      '**Technique 2 - Passive to Active (or Active to Passive):**\n' +
      '- "The government should support local businesses."\n' +
      '  -> "Local companies should be assisted by the authorities."\n\n' +
      '**Technique 3 - Change word form:**\n' +
      '- support (v) -> support/assistance (n) -> supportive (adj)\n' +
      '- "The authorities should provide support for local companies."\n\n' +
      '**Technique 4 - Dummy subjects (It / There):**\n' +
      '- "It is necessary/vital for the authorities to assist local companies."\n' +
      '- "There is growing concern that local businesses need more support."\n\n' +
      '**Technique 5 - Definition or Expansion:**\n' +
      '- government -> "those who lead the nation" / "national policymakers"\n' +
      '- exercise -> "physical training" / "regular physical activity"\n\n' +
      '**Practice:** Paraphrase this sentence using 3 techniques:\n' +
      '"Many people believe that exercise is essential for good health."',
  },

  // ─── GRAMMAR ────────────────────────────────────────────────────────────────

  {
    category: 'Grammar',
    title: 'IELTS 4 Band Descriptors Explained',
    task_filter: null,
    topic_tag: 'grammar',
    source_url: null,
    source_title: SOURCE,
    content:
      'Your IELTS Writing score comes from **4 equally weighted criteria** (25% each):\n\n' +
      '**1. Task Achievement / Task Response (TR)**\n' +
      '- Have you answered ALL parts of the question?\n' +
      '- Is your position clear and consistent throughout?\n' +
      '- Are your ideas relevant, well-developed, and supported with examples?\n\n' +
      '**2. Coherence & Cohesion (CC)**\n' +
      '- Is information arranged logically?\n' +
      '- Do you use cohesive devices (linking words) accurately and effectively?\n' +
      '- Is paragraphing logical (one main idea per paragraph)?\n\n' +
      '**3. Lexical Resource (LR)**\n' +
      '- Do you use a wide range of vocabulary naturally and precisely?\n' +
      '- Do you use less common words with few errors?\n' +
      '- Are spelling and word formation errors minimal?\n\n' +
      '**4. Grammatical Range & Accuracy (GRA)**\n' +
      '- Do you use a variety of sentence structures (simple, compound, complex)?\n' +
      '- Are grammar and punctuation errors rare and not affecting comprehension?\n\n' +
      '**To improve each criterion:**\n' +
      '- TR: Always answer the exact question asked; plan before you write\n' +
      '- CC: Use paragraph topic sentences; vary your linking words\n' +
      '- LR: Learn collocations and topic-specific vocabulary\n' +
      '- GRA: Practise complex sentences with relative clauses, conditionals, passive voice',
  },

  {
    category: 'Grammar',
    title: 'Cohesive Devices & Linking Words for IELTS',
    task_filter: null,
    topic_tag: 'coherence',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Adding information:**\n' +
      '- Furthermore / Moreover / In addition / Additionally / What is more\n\n' +
      '**Contrasting or conceding:**\n' +
      '- However / Nevertheless / On the other hand / In contrast / Although / Despite / While / Whereas\n\n' +
      '**Giving examples:**\n' +
      '- For example / For instance / To illustrate / Such as / Including\n\n' +
      '**Showing cause and effect:**\n' +
      '- Therefore / As a result / Consequently / This leads to / This means that / Because of this\n\n' +
      '**Sequencing (for processes and arguments):**\n' +
      '- First / Initially -> Then / After that / Subsequently / Following this -> Finally / Lastly\n\n' +
      '**Summarising or concluding:**\n' +
      '- In conclusion / To conclude / Overall / In summary / To summarise\n\n' +
      '**Common mistakes:**\n' +
      '- Do NOT start every sentence with a linking word - it sounds mechanical.\n' +
      '- Do NOT use "Firstly, Secondly, Thirdly" for body paragraphs - use these for points within a paragraph.\n' +
      '- "However" must be followed by a comma and introduces a full sentence.\n' +
      '- "Although" begins a subordinate clause:\n' +
      '  Correct: "Although science is important, arts also contribute to development."\n' +
      '  Incorrect: "Although, science is important."',
  },

]

// ── Insert tips (skip duplicates by title) ────────────────────────────────────
async function insertTip(tip: TipToInsert): Promise<boolean> {
  const { data } = await supabase
    .from('tips')
    .select('id')
    .eq('title', tip.title)
    .limit(1)

  if ((data?.length ?? 0) > 0) {
    console.log('  Already exists: ' + tip.title)
    return false
  }

  const { error } = await supabase.from('tips').insert(tip)
  if (error) {
    console.error('  Insert failed: ' + error.message)
    return false
  }
  return true
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nImporting ' + TIPS.length + ' tips from ZIM IELTS Academy...\n')

  let inserted = 0
  let skipped  = 0

  for (const tip of TIPS) {
    const ok = await insertTip(tip)
    if (ok) {
      console.log('  Inserted: ' + tip.title)
      inserted++
    } else {
      skipped++
    }
  }

  console.log('\n-- Summary --')
  console.log('  Inserted : ' + inserted)
  console.log('  Skipped  : ' + skipped)
  console.log('')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
