import { useMemo, useState } from 'react';
import { ArrowRight, Search, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CASE_STUDIES } from '@/lib/case-studies';

const TRAITS = ['Curiosity', 'Resilience', 'Empathy', 'Resourcefulness', 'Leadership', 'Creativity', 'Initiative', 'Iteration', 'Partnerships'];

export default function CaseStudiesPage({ highContrast }: { highContrast: boolean }) {
  const [q, setQ] = useState('');
  const [trait, setTrait] = useState<string | null>(null);
  const hc = highContrast;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CASE_STUDIES.filter((c) => {
      if (trait && !c.mindset.toLowerCase().includes(trait.toLowerCase())) return false;
      return !s || `${c.founder} ${c.company} ${c.mindset}`.toLowerCase().includes(s);
    });
  }, [q, trait]);

  const pill = (active: boolean) => `rounded-full text-xs ${active ? 'border-hub-indicator bg-hub-nav-hover font-bold' : ''}`;

  return (
    <div className="hub-surface space-y-5" data-contrast={hc}>
      <div>
        <h2 className="hub-section-heading">Case Studies</h2>
        <p className={`mt-1 text-sm text-hub-nav-muted`}>
          NEIA Entrepreneurship Companion Guide (Grades 7–8) – 25 Direct Case Readings
        </p>
      </div>
      <div className="relative max-w-xl">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hub-nav-muted`} />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, founder, or mindset trait" aria-label="Search case studies"
          className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none bg-hub-nav text-hub-nav-foreground border border-hub-nav-border focus:border-hub-indicator`} />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by mindset trait">
        <Button variant="hubOutline" className={pill(trait === null)} aria-pressed={trait === null} onClick={() => setTrait(null)}>All</Button>
        {TRAITS.map((t) => (
          <Button variant="hubOutline" key={t} className={pill(trait === t)} aria-pressed={trait === t} onClick={() => setTrait(trait === t ? null : t)}>{t}</Button>
        ))}
      </div>
      <p className={`text-xs text-hub-nav-muted`}>{list.length} of {CASE_STUDIES.length} case studies</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c) => (
          <article key={c.n} className="hub-directory-card flex flex-col p-5 transition-colors">
            <div className={`text-xs font-bold uppercase tracking-wide text-hub-nav-muted`}>Case {c.n}</div>
            <h3 className={`mt-1 text-lg font-bold leading-snug text-hub-nav-muted`}>{c.company}</h3>
            <p className={`text-sm text-hub-nav-muted`}>{c.founder}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.mindset.split(/,\s*(?:and\s+)?|\s+and\s+/).filter(Boolean).map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-hub-nav-hover text-hub-nav-foreground">
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </span>
              ))}
            </div>
            <p className={`mt-3 text-sm text-hub-nav-muted`}><span className="font-semibold">Reading focus: </span>{c.focus}</p>
            <div className={`mt-3 rounded-xl p-3 text-sm flex gap-2 bg-hub-nav-hover`}>
              <MessageCircleQuestion className={`w-4 h-4 shrink-0 mt-0.5 text-hub-indicator`} />
              <span><span className="font-semibold">Presentation question: </span>{c.question}</span>
            </div>
            <div className="flex-1" />
            <Button asChild variant="hubOutline" className="mt-4 self-start">
              <a href={c.link} target="_blank" rel="noopener noreferrer">Read Case Study <ArrowRight /></a>
            </Button>
          </article>
        ))}
      </div>
      {list.length === 0 && <p className={`text-sm text-hub-nav-muted`}>No case studies match. Try another search or trait.</p>}
    </div>
  );
}
