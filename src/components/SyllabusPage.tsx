import { useState } from 'react';
import { GraduationCap, User, Mail, MapPin, CalendarDays, ExternalLink, CheckCircle2, Quote, ChevronDown } from 'lucide-react';

const INFO = [
  { icon: User, label: 'Instructor', value: 'Mr. Pietro Valastro' },
  { icon: Mail, label: 'Contact', value: 'pietro.valastro@neiacademy.org', href: 'mailto:pietro.valastro@neiacademy.org' },
  { icon: MapPin, label: 'Schedule', value: 'Block B | Room B202' },
  { icon: CalendarDays, label: 'Term', value: '2026–2027 | Trimester 1 (Grades 7 & 8)' },
];
const LINKS = [
  ['Class Resource Website', 'https://neiaentrepreneurhub.lovable.app/'],
  ['Google Classroom', 'https://classroom.google.com/c/ODc3MTU4Mzk3NzUy?cjc=u6pzu57n'],
  ['Figma Whiteboard', 'https://www.figma.com/board/BMhyieAhM2wh7Yyo331rVJ/MS-ENTREPRENEURSHIP?node-id=0-1&t=MW5EdDJ6KB9Ccdc3-1'],
  ['Daily Exit Ticket', 'https://docs.google.com/forms/d/e/1FAIpQLSfO5PEET5KrqsldB0ZoBqSE8U20yJalbSRe2DpJCi6SpD4Xbw/viewform'],
  ['Start of Trimester Entry Ticket', 'https://docs.google.com/forms/d/e/1FAIpQLScTYZB2ok_ljADSXSKC8YkydIjnceC5k6X6k39DAOCuQN8TBQ/viewform'],
  ['Case Studies Repository', 'https://docs.google.com/document/d/1uLjoy9Rtu0eTSlJs56VD-iqNQX1n5PNI/edit?usp=sharing&ouid=107355954540387458524&rtpof=true&sd=true'],
];
const OUTCOMES = [
  'Explain the main events of a case study and identify the spark, struggle, shift, and impact.',
  'Support a claim about curiosity, empathy, resilience, adaptability, or another entrepreneurial habit with specific evidence.',
  'Compare founder decisions and consider how teams, resources, customer needs, and circumstances affected them.',
  'Apply ideas from course material to a small problem-solving, research, prototype, or financial activity.',
  'Present a clear case-study analysis, credit sources, answer questions honestly, and respond to feedback.',
  'Reflect on your own learning and identify a useful next step after a challenge.',
];
const PHASES = [
  { n: 1, title: 'Mindset & Founder Stories', when: 'September | Chapter 1', cases: 'Cases 1 (Me & the Bees Lemonade) and 2 (Mo’s Bows)', mindsets: 'Curiosity, initiative, resourcefulness, and resilience', work: 'Story organizer, evidence-based response, local Bug List, and a 60–90 second founder explanation.' },
  { n: 2, title: 'Opportunity Recognition & Empathy', when: 'September–Early October | Chapter 2', cases: 'Cases 6 (Canva) and 8 (Walker & Company / Bevel)', mindsets: 'Empathy, opportunity recognition, ethical problem-solving', work: 'Compare two founders, try a small redesign, present a 2-minute paired comparison.' },
  { n: 3, title: 'Customers & Evidence', when: 'October | Chapter 3', cases: 'Case 7 (Gymshark) + Research Choice (Cases 4, 16, 17, or 24)', mindsets: 'Customer insight, questioning assumptions, evidence-based decisions', work: 'Customer questions, survey interpretation, 2–3 minute evidence-based case briefing.' },
  { n: 4, title: 'Adaptability & Learning from Feedback', when: 'Late October–November | Chapter 4', cases: 'Cases 13 (Notpla) and 20 (Stardew Valley)', mindsets: 'Experimentation, adaptability, persistence, failure as feedback', work: 'Test simple model, make one revision, give 3-minute explanation of feedback & change.' },
  { n: 5, title: 'Resource Decisions & Case Synthesis', when: 'Late November–Mid December | Chapter 5', cases: 'Case 18 (Duolingo) + Unused Student Choice Case', mindsets: 'Responsible decisions, resourcefulness, reflection, clear communication', work: 'Budget/price simulation, 4–6 minute case presentation with Q&A, individual reflection.' },
];
const ASSIGNMENTS = [
  ['Week 2', 'Assignment 1: Entrepreneur Challenges & Opportunities Presentation', '5-slide Canva presentation on an entrepreneur from the hub.'],
  ['Week 3', 'Assignment 2: Meet the Entrepreneur YOU', '8-slide Canva presentation on personal interests, mindset habits, 5 goals, and your definition of success.'],
  ['Week 4', 'Assignment 3: Entrepreneurial Mindset in Action Infographic', 'Canva infographic on mindset traits, calculated risk vs. gambling, and problem-to-value steps.'],
  ['Mid-December', 'Final Presentation & Portfolio', '4–6 minute presentation analyzing founder decisions, the spark/struggle/shift/impact model, mindset habits, and a comparison to another case study.'],
];
const POLICIES = [
  ['Assessment & Feedback', 'Evaluated using the IDEA Competency-Based Formative Assessment Rubric focusing on "Glows" (strengths) and "Grows" (areas for growth). Continuous formative practice without separate reassessments.'],
  ['Daily Routine', 'Figma Whiteboard Question of the Day (QOTD) → Main Case Lesson → Daily Exit Ticket (Google Form).'],
  ['Late Work & Absence Policy', 'Written extensions preferred in advance via email. Coordinate missed activities promptly after return.'],
  ['Collaboration & Academic Integrity', 'Respectful teamwork, individual reflection, cite sources, and disclosed AI usage when authorized.'],
];
const TABS = ['Overview', 'Trimester Timeline', 'Assignments', 'Policies', 'Resources'];

export default function SyllabusPage({ highContrast: hc }: { highContrast: boolean }) {
  const [tab, setTab] = useState('Overview');
  const [open, setOpen] = useState<number | null>(0);
  const card = hc ? 'bg-zinc-900 border-2 border-yellow-400 text-white' : 'bg-white border border-[#414042]/15 shadow-md text-[#414042]';
  const accent = hc ? 'text-yellow-300' : 'text-[#C51C63]';
  const muted = hc ? 'text-white/85' : 'text-[#414042]/75';
  const btn = hc ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-[#C51C63] text-white shadow-md shadow-[#C51C63]/20 hover:bg-[#C51C63]/90';

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${hc ? 'text-yellow-300' : 'text-[#414042]'}`}>
          <GraduationCap className={accent} /> Course Syllabus
        </h2>
        <p className={`mt-1 text-sm ${muted}`}>MS Entrepreneurship: Entrepreneurial Mindset through Case Studies (Grades 7 &amp; 8 | Fall Trimester)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {INFO.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className={`rounded-2xl p-4 ${card}`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${hc ? 'text-yellow-300' : 'text-[#E94928]'}`}><Icon className="w-4 h-4" />{label}</div>
            {href ? <a href={href} className={`mt-1 block text-sm font-semibold break-all underline ${accent}`}>{value}</a> : <div className="mt-1 text-sm font-semibold">{value}</div>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {LINKS.map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${btn}`}>
            <ExternalLink className="w-3.5 h-3.5" />{label}
          </a>
        ))}
      </div>

      <div role="tablist" aria-label="Syllabus sections" className={`flex flex-wrap gap-1 border-b ${hc ? 'border-yellow-400' : 'border-[#414042]/15'}`}>
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${tab === t ? (hc ? 'border-yellow-400 text-yellow-300' : 'border-[#C51C63] text-[#C51C63]') : (hc ? 'border-transparent text-white' : 'border-transparent text-[#414042]/70 hover:text-[#414042]')}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-6 ${card}`}>
            <h3 className="text-lg font-bold">Welcome!</h3>
            <p className={`mt-2 text-sm leading-relaxed ${muted}`}>Welcome! I am your Entrepreneurship teacher, Mr. Pietro Valastro, and I am thrilled to embark on this journey with you. This year, we aren't just studying business. We are actively building, sharpening, and applying our entrepreneurial mindsets. Over the coming months, you will learn to think like a problem harvester and an opportunity seeker... Ready. Set. Innovate.</p>
          </div>
          <div className={`rounded-2xl p-6 flex gap-3 ${hc ? 'bg-black border-2 border-yellow-400 text-white' : 'bg-[#C51C63]/5 border border-[#C51C63]/20 text-[#414042]'}`}>
            <Quote className={`w-6 h-6 shrink-0 ${accent}`} />
            <div>
              <div className={`text-xs font-bold uppercase tracking-wide ${accent}`}>Entrepreneurship at NEIA</div>
              <p className="mt-1 text-base font-medium leading-relaxed">“Entrepreneurship is the process of providing leadership and gathering resources to create feasible, scalable, and sustainable solutions that create greater economic and social value.”</p>
            </div>
          </div>
          <h3 className="text-lg font-bold">Learning Outcomes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OUTCOMES.map((o) => (
              <div key={o} className={`rounded-xl p-4 flex gap-3 text-sm ${card}`}><CheckCircle2 className={`w-5 h-5 shrink-0 ${hc ? 'text-yellow-300' : 'text-[#EFA835]'}`} />{o}</div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Trimester Timeline' && (
        <ol className="relative space-y-4 pl-8">
          <span aria-hidden className={`absolute left-3 top-2 bottom-2 w-0.5 ${hc ? 'bg-yellow-400' : 'bg-[#C51C63]/25'}`} />
          {PHASES.map((p) => (
            <li key={p.n} className="relative">
              <span className={`absolute -left-8 top-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${hc ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white'}`}>{p.n}</span>
              <div className={`rounded-2xl p-5 ${card}`}>
                <div className={`text-xs font-bold uppercase tracking-wide ${hc ? 'text-yellow-300' : 'text-[#E94928]'}`}>Phase {p.n} · {p.when}</div>
                <h4 className="mt-1 font-bold">{p.title}</h4>
                <dl className={`mt-2 space-y-1 text-sm ${muted}`}>
                  <div><dt className="inline font-semibold">Focus cases: </dt><dd className="inline">{p.cases}</dd></div>
                  <div><dt className="inline font-semibold">Mindsets: </dt><dd className="inline">{p.mindsets}</dd></div>
                  <div><dt className="inline font-semibold">Student work: </dt><dd className="inline">{p.work}</dd></div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      )}

      {tab === 'Assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ASSIGNMENTS.map(([when, title, desc], i) => (
            <div key={title} className={`rounded-2xl p-5 ${i === 3 ? (hc ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-[#414042] text-white shadow-lg') : card}`}>
              <div className={`text-xs font-bold uppercase tracking-wide ${i === 3 ? '' : (hc ? 'text-yellow-300' : 'text-[#E94928]')}`}>{when}</div>
              <h4 className="mt-1 font-bold">{title}</h4>
              <p className={`mt-1 text-sm ${i === 3 ? '' : muted}`}>{desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'Policies' && (
        <div className="space-y-2">
          {POLICIES.map(([title, body], i) => (
            <div key={title} className={`rounded-xl ${card}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left font-semibold">
                {title}<ChevronDown className={`w-4 h-4 transition ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className={`px-4 pb-4 text-sm ${muted}`}>{body}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'Resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {LINKS.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer" className={`rounded-xl p-4 flex items-center justify-between font-semibold text-sm ${card}`}>
              {label}<ExternalLink className={`w-4 h-4 ${accent}`} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
