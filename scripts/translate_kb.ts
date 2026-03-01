import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';


const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function translateText(texts: string[]): Promise<string[]> {
    if (texts.length === 0) return [];

    const prompt = `Translate the following English texts exactly into Vietnamese.
Maintain IELTS academic context and tone.
Important constraints:
- Return ONLY a JSON array of strings corresponding 1:1 with the input array.
- Do NOT output anything else.
Input Array:
${JSON.stringify(texts, null, 2)}`;

    const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '[]';
    try {
        const cleaned = response.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Failed translating batch. Returning original texts as fallback.', response);
        return texts.map(t => '[TR_FAILED] ' + t);
    }
}

// Keys that are strings or array of strings to translate and duplicate with _vi suffix
const TARGET_KEYS = new Set([
    'task_name', 'description', 'criterion_name', 'descriptor_summary',
    'typical_performance', 'overall_profile', 'common_problems',
    'upgrade_strategies', 'key_strengths', 'key_weaknesses',
    'global_upgrade_advice', 'focus_areas', 'practice_recommendations', 'myths_to_avoid'
]);

async function processObject(obj: any): Promise<any> {
    if (Array.isArray(obj)) {
        const res = [];
        for (const item of obj) res.push(await processObject(item));
        return res;
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            newObj[key] = await processObject(val);

            // If it's a target key, add _vi translation
            if (TARGET_KEYS.has(key)) {
                if (typeof val === 'string') {
                    console.log(`Translating single string for key: ${key}`);
                    try {
                        const translated = await translateText([val]);
                        newObj[`${key}_vi`] = translated[0] || val;
                    } catch {
                        newObj[`${key}_vi`] = val;
                    }
                } else if (Array.isArray(val) && val.every(v => typeof v === 'string')) {
                    console.log(`Translating string array for key: ${key} (len=${val.length})`);
                    try {
                        const translated = await translateText(val);
                        newObj[`${key}_vi`] = translated.length === val.length ? translated : val;
                    } catch {
                        newObj[`${key}_vi`] = val;
                    }
                }
            }
        }
        return newObj;
    }
    return obj;
}

// Use Haiku as it handles small batches very fast
async function main() {
    console.log('Starting translation generation...');
    const raw = fs.readFileSync('src/lib/ielts_acad_writing_kb.json', 'utf8');
    const data = JSON.parse(raw);
    const bilingual = await processObject(data);

    fs.writeFileSync('src/lib/ielts_acad_writing_kb_bilingual.json', JSON.stringify(bilingual, null, 2));
    console.log('Wrote to src/lib/ielts_acad_writing_kb_bilingual.json');
}

main().catch(console.error);
