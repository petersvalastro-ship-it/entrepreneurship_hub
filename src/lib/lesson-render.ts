// Turns a structured lesson (built from an uploaded PDF) into an assignment page
// that matches the hand-built assignments: same fonts, heading scale and fields.

export type LessonBlock =
  | { type: 'text'; text: string }
  | { type: 'prompt'; label: string; hint?: string; tall?: boolean }
  | { type: 'table'; columns: string[]; rowLabels?: string[]; rows?: number }
  | { type: 'checklist'; items: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'case'; heading: string; text: string; focus?: string; url?: string; linkLabel?: string };

export type LessonSpec = {
  title: string;
  tags: string;
  intro: string;
  finalProduct: string;
  classTime: string;
  questionOfDay: string;
  plan: { activity: string; minutes: string; task: string }[];
  targets: string[];
  sections: { heading: string; blocks: LessonBlock[] }[];
};

const STYLE = "\n:root{--purple:#64219a;--pink:#ce196a;--orange:#ef542f;--ink:#242424;--line:#e8dfe8}\n*{box-sizing:border-box}\nbody{margin:0;font-family:\"DM Sans\",sans-serif;color:var(--ink);font-size:16px;line-height:1.6;background:#fbf7fd}\n.sheet{max-width:1050px;margin:clamp(12px,3vw,38px) auto;background:#fff;border:1px solid #efe5e6;border-radius:25px;box-shadow:0 20px 65px #53246b13;overflow:hidden}\nheader{background:var(--purple);color:#fff;padding:clamp(25px,5vw,56px);position:relative;overflow:hidden}\nheader:after{content:\"\u2726\";position:absolute;right:28px;bottom:4px;color:#ffcb45;font-size:75px;transform:rotate(-16deg)}\n.eyebrow{letter-spacing:.1em;text-transform:uppercase;font-size:12px;font-weight:800;font-family:\"Space Mono\",monospace}\nbody h1{font-size:42px;line-height:1.08;letter-spacing:-.04em;margin:10px 0 6px;font-weight:800}\nbody h2{font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1.2;margin:0 0 12px}\nbody h3{font-size:19px;font-weight:800;margin:0 0 6px}\nbody h4{font-size:17px;font-weight:800;margin:0 0 4px}\n.sub{font-size:22px;font-weight:700;color:#ffcb45;margin:0 0 14px}\n.content{padding:clamp(21px,5vw,54px)}\n.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}\n.card{border-radius:16px;padding:16px 18px;border:1px solid #e9ddea;background:#faf5fd}\n.card:nth-child(2){background:#fff0f6}.card:nth-child(3){background:#fff3e9}\n.card strong{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--purple)}\nsection{border-top:2px dashed var(--line);padding-top:30px;margin-top:36px}\n.num{font-family:\"Space Mono\",monospace;color:var(--pink);font-size:13px;font-weight:700}\nlabel,.prompt{font-weight:700;display:block;margin:14px 0 6px}\n.field{width:100%;border:2px solid #ded2e1;border-radius:12px;padding:11px 13px;font:inherit;color:var(--ink);background:#fff}\n.field:focus{border-color:var(--purple);outline:none;box-shadow:0 0 0 4px #64219a16}\ntextarea.field{min-height:96px;resize:vertical}\ntable{width:100%;border-collapse:collapse;margin-top:8px}\nth,td{border-bottom:1px solid var(--line);padding:10px;text-align:left;vertical-align:top}\nth{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--purple)}\ntd .field{min-height:0}\nul{margin:6px 0;padding-left:22px}\n.frames{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n.frame{border:2px solid #ead9f5;border-radius:16px;padding:16px;background:#fdfaff}\n.frame h3{color:var(--purple)}\n.check{display:flex;gap:10px;align-items:flex-start;font-weight:500;margin:8px 0}\n.check input{width:20px;height:20px;margin-top:3px;accent-color:var(--purple)}\n.note{background:#fff3e9;border-radius:12px;padding:12px 14px;font-size:15px}\n.rebus{min-height:220px;font-family:\"Space Mono\",monospace}\na{color:var(--pink);font-weight:700}\n@media(max-width:720px){.cards,.frames{grid-template-columns:1fr}body h1{font-size:34px}}\n@media print{body{background:#fff}.sheet{box-shadow:none;border:0;margin:0}section{break-inside:avoid}}\n.plan td:nth-child(2){font-family:\"Space Mono\",monospace;font-weight:700;color:var(--pink)}\n.qod{background:#faf5fd;border-left:5px solid var(--pink);border-radius:12px;padding:14px 16px;font-size:18px;font-weight:700}\n.case{border:2px solid #ead9f5;border-radius:16px;padding:16px;background:#fdfaff;margin-top:14px}\n.case{display:flex;gap:18px;align-items:stretch}.case-btn{flex:0 0 190px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;background:var(--pink);color:#fff!important;text-decoration:none;border-radius:14px;padding:16px 12px;font-size:15px;line-height:1.3;box-shadow:0 6px 18px #ce196a33;transition:transform .15s,background .15s}.case-btn:hover{background:var(--purple);transform:translateY(-2px)}.case-btn .ico{font-size:34px;line-height:1}.case-btn small{font-family:\"Space Mono\",monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.9}.case-body{flex:1;min-width:0}@media(max-width:720px){.case{flex-direction:column}.case-btn{flex-basis:auto}}@media print{.case-btn{box-shadow:none}}\n.tags{font-family:\"Space Mono\",monospace;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#fff;opacity:.9}\n";

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeUrl = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : '');

export function renderLessonHtml(spec: LessonSpec, dateText: string, chapterLabel = ''): string {
  let n = 0;
  const id = () => `lu${++n}`;
  const ta = (label: string, hint = '', tall = false) => {
    const i = id();
    const h = hint ? `<span style="font-weight:400;font-style:italic"> ${esc(hint)}</span>` : '';
    return `<label for="${i}">${esc(label)}${h}</label><textarea class="field" id="${i}" name="${i}"${tall ? ' style="min-height:180px"' : ''}></textarea>`;
  };
  const cell = (label: string) => {
    const i = id();
    return `<textarea class="field" id="${i}" name="${i}" aria-label="${esc(label)}" style="min-height:60px"></textarea>`;
  };
  const block = (b: LessonBlock): string => {
    switch (b.type) {
      case 'text':
        return `<p>${esc(b.text)}</p>`;
      case 'prompt':
        return ta(b.label, b.hint, b.tall);
      case 'list':
        return `<ul>${b.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
      case 'checklist':
        return b.items
          .map((t) => {
            const i = id();
            return `<label class="check" for="${i}"><input type="checkbox" id="${i}" name="${i}"><span>${esc(t)}</span></label>`;
          })
          .join('');
      case 'case': {
        const url = safeUrl(b.url);
        const btn = url ? `<a class="case-btn" href="${esc(url)}" target="_blank" rel="noreferrer"><span class="ico">📖</span>Click here to read the ${esc(b.heading)} Case Study<small>Opens in a new tab ↗</small></a>` : '';
        return `<div class="case">${btn}<div class="case-body"><h3>${esc(b.heading)}</h3><p>${esc(b.text)}</p>${b.focus ? `<p><b>Reading focus:</b> ${esc(b.focus)}</p>` : ''}</div></div>`;
      }
      case 'table': {
        const cols = b.columns.length ? b.columns : ['Answer'];
        const labeled = b.rowLabels && b.rowLabels.length > 0;
        const count = labeled ? b.rowLabels!.length : Math.min(Math.max(b.rows ?? 3, 1), 12);
        let rows = '';
        for (let r = 0; r < count; r++) {
          rows += '<tr>' + cols.map((c, ci) => (labeled && ci === 0 ? `<td><b>${esc(b.rowLabels![r])}</b></td>` : `<td>${cell(`${c} ${r + 1}`)}</td>`)).join('') + '</tr>';
        }
        return `<table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
      }
      default:
        return '';
    }
  };
  const qod = spec.questionOfDay
    ? `<section><div class="num">Start</div><h2>Question of the Day</h2><p class="qod">${esc(spec.questionOfDay)}</p>${ta('My answer:')}</section>`
    : '';
  const plan = spec.plan.length
    ? `<section><div class="num">Plan</div><h2>Plan for Today</h2><table class="plan"><thead><tr><th>Time</th><th>Minutes</th><th>What You Will Do</th></tr></thead><tbody>${spec.plan.map((p) => `<tr><td><b>${esc(p.activity)}</b></td><td>${esc(p.minutes)}</td><td>${esc(p.task)}</td></tr>`).join('')}</tbody></table></section>`
    : '';
  const targets = spec.targets.length
    ? `<section><div class="num">Goals</div><h2>Learning Targets</h2><ul>${spec.targets.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`
    : '';
  const body = spec.sections
    .map((s, i) => `<section><div class="num">${String(i).padStart(2, '0')}</div><h2>${esc(s.heading)}</h2>${s.blocks.map(block).join('')}</section>`)
    .join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&amp;family=Space+Mono:wght@400;700&amp;display=swap" rel="stylesheet">
<style>${STYLE}</style></head>
<body><div class="sheet"><header>
<div class="eyebrow">MS Entrepreneurship${chapterLabel ? ` · ${esc(chapterLabel)}` : ''} · ${esc(dateText)}</div>
<h1>${esc(spec.title)}</h1>${spec.tags ? `<p class="tags">${esc(spec.tags)}</p>` : ''}
${spec.intro ? `<p>${esc(spec.intro)}</p>` : ''}
</header><div class="content">
<div class="cards"><div class="card"><strong>Date</strong>${esc(dateText)}</div><div class="card"><strong>Class Time</strong>${esc(spec.classTime || '45 minutes')}</div><div class="card"><strong>Final Product</strong>${esc(spec.finalProduct || 'Completed assignment')}</div></div>
${qod}${plan}${targets}${body}
<section><div class="num">Submit</div><h2>Turn It In</h2><p class="note">Click <b>Submit to Pietro</b> when you are finished. Backup: save this page as a PDF and email it to Pietro.</p></section>
</div></div></body></html>`;
}
