import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import type { LessonSpec } from './lesson-render';

const Block = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({ type: z.literal('prompt'), label: z.string(), hint: z.string().optional(), tall: z.boolean().optional() }),
  z.object({ type: z.literal('table'), columns: z.array(z.string()), rowLabels: z.array(z.string()).optional(), rows: z.number().optional() }),
  z.object({ type: z.literal('checklist'), items: z.array(z.string()) }),
  z.object({ type: z.literal('list'), items: z.array(z.string()) }),
  z.object({ type: z.literal('case'), heading: z.string(), text: z.string(), focus: z.string().optional(), url: z.string().optional(), linkLabel: z.string().optional() }),
]);

const Result = z.object({
  title: z.string(),
  tags: z.string().default(''),
  intro: z.string().default(''),
  finalProduct: z.string().default(''),
  classTime: z.string().default('45 minutes'),
  questionOfDay: z.string().default(''),
  plan: z.array(z.object({ activity: z.string(), minutes: z.coerce.string(), task: z.string() })).default([]),
  targets: z.array(z.string()).default([]),
  sections: z.array(z.object({ heading: z.string(), blocks: z.array(Block.or(z.any())).default([]) })).default([]),
  focus: z.string().default(''),
  description: z.string().default(''),
});

const SYSTEM = `You convert a middle-school entrepreneurship lesson PDF (given as extracted text, page by page, plus any links) into JSON for an interactive online worksheet.
Keep the teacher's wording exactly; do not invent content. Drop repeated page headers/footers like "MS ENTREPRENEURSHIP | NOVEMBER 10 2026", "PAGE 2" and the footer step words.
Every place a student writes, ticks or fills a table becomes a field.
Return ONLY a JSON object with these keys:
- title: lesson title without the weekday/date prefix (e.g. "Friday, November 13, Redesign Challenge" -> "Redesign Challenge"). Title Case.
- tags: the short topic line under the title, joined with " · ".
- intro: the intro paragraph.
- finalProduct, classTime: from the info cards.
- questionOfDay: text of the Question of the Day ("" if none).
- plan: rows of the "Plan for Today" table as {activity, minutes, task}.
- targets: the learning targets ("I can ...").
- sections: every remaining section in order, each {heading (Title Case), blocks}. Do NOT repeat Question of the Day, Plan for Today or Learning Targets here.
  Block types:
  {"type":"text","text":...} instructions/paragraphs;
  {"type":"prompt","label":...,"hint":optional,"tall":true only for sketch/drawing spaces} for each write-in box (labels in sentence case, not ALL CAPS; put sketch instructions as hint and say "Describe or type out your sketch.");
  {"type":"table","columns":[...],"rowLabels":[...] when the first column has printed labels (the first column header stays in columns), otherwise "rows": number of blank rows (default 5)};
  {"type":"checklist","items":[...]} for check boxes;
  {"type":"list","items":[...]} for bullet examples;
  {"type":"case","heading":...,"text":...,"focus":optional reading focus,"url":optional source link from the links list,"linkLabel":optional} for case-study snapshots.
- focus: a short card label like "Chapter 2 · Needs and wants · Observation" (sentence case after the chapter).
- description: 1–2 sentences for students summarising the work, ending with "Click Submit to Pietro when you are finished."
Students call the teacher "Pietro" — never write "Mr. Valastro". Where the PDF says to turn work in, say to click Submit to Pietro.`;

/** Teacher-only: turns the text of an uploaded lesson PDF into a structured worksheet. */
export const structureLesson = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ text: z.string().min(20).max(80_000), links: z.array(z.string()).max(50).default([]) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ spec: LessonSpec; focus: string; description: string }> => {
    const { data: roles } = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId).eq('role', 'teacher');
    if (!roles || roles.length === 0) throw new Error('Only the teacher can upload lessons.');
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) throw new Error('AI is not configured for this app yet.');

    const user = `LINKS FOUND IN THE PDF:\n${data.links.join('\n') || '(none)'}\n\nPDF TEXT:\n${data.text}`;
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'Lovable-API-Key': apiKey },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: user },
        ],
      }),
    });
    if (res.status === 429) throw new Error('Too many requests right now. Please try again in a minute.');
    if (res.status === 402) throw new Error('AI credits have run out for this workspace.');
    if (!res.ok) throw new Error('The lesson could not be read. Please try again.');
    const json: any = await res.json();
    const raw = String(json?.choices?.[0]?.message?.content ?? '').replace(/^```(?:json)?|```$/g, '').trim();
    let parsed: z.infer<typeof Result>;
    try {
      parsed = Result.parse(JSON.parse(raw));
    } catch {
      throw new Error('The lesson came back in an unexpected shape. Please try again.');
    }
    const sections = parsed.sections.map((s) => ({
      heading: s.heading,
      blocks: s.blocks.filter((b: unknown) => Block.safeParse(b).success) as LessonSpec['sections'][number]['blocks'],
    }));
    const { focus, description, ...rest } = parsed;
    return { spec: { ...rest, sections }, focus, description };
  });
