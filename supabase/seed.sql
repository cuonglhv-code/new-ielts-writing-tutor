-- ============================================================
-- Jaxtina IELTS v2 — Seed Data
-- Run AFTER 001_schema.sql
-- ============================================================

-- ──────────────────────────────────────
-- QUESTIONS (10 sample questions)
-- ──────────────────────────────────────
insert into public.questions (task_type, topic, difficulty, question_text) values

-- Task 1 questions
('task1', 'Society', 'Band 5-6',
'The bar chart below shows the percentage of people in different age groups who used social media platforms daily in 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.'),

('task1', 'Environment', 'Band 6-7',
'The line graph below shows CO₂ emissions (in metric tonnes per person) in three countries — the United Kingdom, China, and Brazil — between 1990 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.'),

('task1', 'Economy', 'Band 6-7',
'The table below gives information about the number of international students enrolled in universities in five countries in 2010 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.'),

('task1', 'Environment', 'Band 7-8',
'The two pie charts below show the proportion of energy produced from different sources in a European country in 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.'),

('task1', 'Environment', 'Band 7-8',
'The diagram below illustrates the process by which paper is recycled.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.'),

-- Task 2 questions
('task2', 'Health', 'Band 5-6',
'Some people think that governments should ban fast food advertising, especially advertisements aimed at children. Others believe that it is the responsibility of parents to control what their children eat.

Discuss both views and give your own opinion.

Write at least 250 words.'),

('task2', 'Technology', 'Band 5-6',
'In recent years, many people choose to work from home rather than in an office. Some people believe this has many advantages, while others think it creates significant problems.

Discuss both views and give your own opinion.

Write at least 250 words.'),

('task2', 'Transport', 'Band 6-7',
'Traffic congestion in cities has become a major problem worldwide. What are the main causes of this problem? What measures could be taken to reduce traffic congestion?

Write at least 250 words.'),

('task2', 'Education', 'Band 6-7',
'Online education has become increasingly popular in recent years. What are the advantages and disadvantages of studying online compared to traditional classroom learning?

Write at least 250 words.'),

('task2', 'Society', 'Band 7-8',
'In many countries, people are moving from rural areas to cities. Why do people move to cities? Is this a positive or negative development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.');

-- ──────────────────────────────────────
-- TIPS (15 tips across 5 categories)
-- ──────────────────────────────────────
insert into public.tips (category, title, content) values

-- Task 1 Structure
('Task 1 Structure', 'How to Write a Strong Introduction',
'Your Task 1 introduction should paraphrase the question prompt — do NOT copy it word for word. Identify the type of data (e.g., bar chart, line graph, pie chart), the topic, and the time period if relevant.

**Example:** If the question says "The bar chart shows the percentage of people who exercise regularly in five countries in 2020," your introduction could be: "The bar chart illustrates the proportion of the population who exercised on a regular basis across five nations in 2020."

**Key points:**
- Change the vocabulary (use synonyms)
- Keep it to 1–2 sentences
- Do not give data figures in the introduction
- Do not state your opinion'),

('Task 1 Structure', 'Writing an Effective Overview',
'The overview is the most important paragraph in Task 1. It summarises the most significant trends, differences, or stages — without specific data figures.

An overview is NOT a conclusion. You are describing what stands out most, not summarising everything.

**Formula:** "Overall, it is clear that [main trend 1]. Additionally, [main trend 2]."

**What to include:**
- The highest/lowest values
- The most notable change over time
- The most striking comparison between groups

**What NOT to include:**
- Specific numbers or percentages
- Minor details
- Your personal interpretation'),

('Task 1 Structure', 'Organising Body Paragraphs',
'After your introduction and overview, write 2 body paragraphs that describe specific data with supporting figures.

**How to organise:**
- Group related data together (e.g., countries with similar trends, categories that increase vs. those that decrease)
- Use data selectively — you do not need to describe every figure
- Support each point with specific numbers from the chart

**Paragraph structure:**
1. Topic sentence (general trend)
2. Supporting data (specific figures, percentages, years)
3. Comparison or contrast with another data point

**Useful language:** "In contrast...", "Similarly...", "While X rose to..., Y fell to..."'),

-- Task 2 Argument Development
('Task 2 Argument Development', 'Planning Your Task 2 Essay',
'Spend 5 minutes planning before you write. A well-planned essay scores significantly higher on Task Response and Coherence.

**Planning steps:**
1. Identify the essay type (opinion, discussion, problem/solution, advantages/disadvantages)
2. Decide your position (if asked for opinion)
3. Brainstorm 2–3 main points for each side or position
4. Choose the strongest 2 points to develop
5. Think of one example or reason for each point

**Essay structure:**
- Introduction (2–3 sentences)
- Body Paragraph 1 (main idea + development + example)
- Body Paragraph 2 (main idea + development + example)
- Body Paragraph 3 (optional: counter-argument or additional point)
- Conclusion (1–2 sentences)'),

('Task 2 Argument Development', 'Writing a High-Scoring Body Paragraph',
'Each body paragraph should have one clear main idea, developed with reasons and examples. Examiners call this "extending and supporting ideas."

**The PEEL structure:**
- **P**oint: State your main idea clearly
- **E**xplain: Give a reason why this is true
- **E**xample: Provide a specific example (real or hypothetical)
- **L**ink: Connect back to the essay question

**Example:**
"One major benefit of remote work is increased employee productivity (Point). When people work from home, they avoid lengthy commutes and open-plan office distractions, allowing them to focus more effectively (Explain). For instance, a Stanford University study found that remote workers were 13% more productive than their office-based counterparts (Example). This suggests that flexible working arrangements can benefit both employees and employers alike (Link)."'),

('Task 2 Argument Development', 'Writing a Strong Conclusion',
'Your conclusion should summarise your main points and restate your position — but do not introduce new ideas.

**For opinion essays:**
"In conclusion, although [opposing view], I firmly believe that [your position] because [brief reason]."

**For discussion essays:**
"In conclusion, while [view 1] has its merits, [view 2] appears to offer greater benefits in the long term."

**Common mistakes to avoid:**
- Do not start with "In a nutshell" or "Last but not least" — these are informal
- Do not write a very long conclusion (5+ sentences)
- Do not add new arguments
- Do not contradict what you said in the body paragraphs'),

-- Vocabulary
('Vocabulary', 'Building Your Academic Vocabulary',
'Lexical Resource accounts for 25% of your Writing score. A wide range of vocabulary, used accurately, can significantly boost your band.

**Strategies:**
1. **Use synonyms** — Do not repeat the same word. Learn synonyms for common IELTS topics (e.g., "increase" → rise, grow, surge, climb, escalate)
2. **Use collocations** — Words that naturally go together (e.g., "take measures", "raise awareness", "have a detrimental effect")
3. **Use topic-specific vocabulary** — Environment: emissions, biodiversity, sustainability; Education: academic achievement, curriculum, pedagogy

**Words to avoid (too informal):**
- "a lot" → a considerable amount / a significant number
- "big" → substantial / significant / considerable
- "bad" → detrimental / harmful / adverse
- "show" → illustrate / demonstrate / indicate'),

('Vocabulary', 'Avoiding Repetition with Referencing',
'Coherence and Cohesion rewards varied referencing. Instead of repeating the same noun, use:

**Pronouns:** "Governments should invest in renewable energy. They [= governments] should..."

**Synonyms:** "Urban areas are growing rapidly. These cities [= urban areas] face..."

**General nouns:** "Many students struggle with time management. This problem [= struggling with time management] affects..."

**Demonstratives:** "Crime rates have fallen significantly. This trend [= falling crime rates]..."

**Practice:** Underline all repetitions in your essays and replace at least half of them with alternative references.'),

-- Grammar
('Grammar', 'Using Complex Sentence Structures',
'Grammatical Range and Accuracy rewards a variety of sentence structures. Using only simple sentences will limit your band to around 5.

**Structures to practise:**

**1. Relative clauses:**
"The students who study abroad often develop stronger language skills."
"The report, which was published in 2023, revealed..."

**2. Conditional sentences:**
"If governments invested more in public transport, traffic congestion would decrease significantly."

**3. Passive voice (essential for Task 1 processes):**
"Raw materials are collected and transported to the factory."

**4. Participle clauses:**
"Having considered both sides of the argument, I believe..."

**5. Noun clauses:**
"It is widely believed that climate change is the greatest challenge of our time."'),

('Grammar', 'Common Grammar Mistakes to Avoid',
'These are the most frequent grammar errors in IELTS Writing that lower band scores:

**1. Subject-verb agreement:**
❌ "The number of people are increasing."
✅ "The number of people is increasing."

**2. Article errors (a/an/the):**
❌ "Government should take action."
✅ "The government should take action."

**3. Wrong prepositions:**
❌ "There was an increase of 10% in 2020."
✅ "There was an increase of 10% in 2020." ← correct
❌ "The report shows an increase at 10%."

**4. Run-on sentences:**
❌ "Technology is advancing rapidly, this creates both opportunities and challenges, governments must respond."
✅ Split into separate sentences or use conjunctions properly.

**5. Incorrect use of "although":**
❌ "Although technology has benefits, but it also has drawbacks."
✅ "Although technology has benefits, it also has drawbacks."'),

-- Time Management
('Time Management', 'Allocating Time in the IELTS Writing Test',
'The IELTS Academic Writing test is 60 minutes long, with two tasks:

**Recommended time allocation:**
- Task 1: 20 minutes (≈150+ words)
- Task 2: 40 minutes (≈250+ words)

Task 2 is worth more marks, so always allocate more time to it.

**Within each task:**
- Planning: 2–3 minutes (Task 1) / 4–5 minutes (Task 2)
- Writing: 15 minutes (Task 1) / 30 minutes (Task 2)
- Checking: 2 minutes each

**Always do Task 1 first** — it is shorter and gives you a confidence boost before the longer essay.'),

('Time Management', 'What to Do in the Final 5 Minutes',
'Never spend your final minutes writing new content — use this time to check and improve what you have written.

**Checking checklist:**
☑ Have I answered ALL parts of the question?
☑ Does my essay/report meet the minimum word count? (150 for Task 1, 250 for Task 2)
☑ Have I included an overview paragraph? (Task 1)
☑ Does each paragraph have a clear main idea?
☑ Are there any obvious spelling mistakes?
☑ Have I used correct punctuation?
☑ Have I varied my vocabulary (avoided repeating the same words)?
☑ Have I used a range of sentence structures?

**Quick fixes that boost your score:**
- Replace repeated words with synonyms
- Add a linking phrase to the start of a sentence ("Furthermore,", "In contrast,")
- Break an overly long sentence into two shorter ones for clarity');
