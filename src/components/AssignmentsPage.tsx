import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight, CalendarDays, Sparkles, ChevronDown, ChevronLeft, ChevronRight, History, List, Rocket } from 'lucide-react';
import { groupAssignmentWeeks, weekMonday, type AssignmentWeek, type WeekKind } from '@/lib/assignment-weeks';
import { useAssignments, type AssignmentEntry } from '@/hooks/useAssignments';

const LABEL: Record<WeekKind, string> = { upcoming: 'Coming Up', current: 'This Week', last: 'Last Week', prior: '' };
const DAY = 86_400_000;
const utcToday = () => { const n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); };

export default function AssignmentsPage({ highContrast, onOpen }: { highContrast: boolean; onOpen: (tab: string) => void }) {
  const hc = highContrast;
  const { entries } = useAssignments();
  const today = useMemo(utcToday, []);
  const weeks = useMemo(() => groupAssignmentWeeks(entries, (e) => e.dateObj, today), [entries, today]);
  const nextUpcoming = [...weeks].reverse().find((w) => w.kind === 'upcoming')?.key;
  const currentEmpty = weeks.find((w) => w.kind === 'current')?.items.length === 0;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (w: AssignmentWeek<AssignmentEntry>) => open[w.key] ?? (w.kind === 'current' || (currentEmpty && w.key === nextUpcoming));
  const toggle = (w: AssignmentWeek<AssignmentEntry>) => setOpen((o) => ({ ...o, [w.key]: !isOpen(w) }));
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const card = 'hub-directory-card text-hub-nav-foreground';
  const accent = 'text-hub-indicator';
  const muted = 'text-hub-nav-muted';
  const badge = 'bg-hub-nav-hover border border-hub-nav-border text-hub-nav-foreground';
  const btn = 'h-auto whitespace-normal text-left';
  const gray = 'bg-hub-nav-hover border border-hub-nav-border text-hub-nav-foreground hover:bg-hub-nav';
  const pink = 'bg-hub-nav-hover text-hub-nav-foreground border border-hub-nav-border border-l-4 border-l-hub-indicator';
  const coming = gray;
  const groupTitle = `text-lg font-extrabold flex items-center gap-2 text-hub-nav-foreground`;

  const dateBadge = (a: AssignmentEntry) => (a.until ? `${a.date.replace(/, \d{4}$/, '')} – ${a.until}` : a.date);

  const renderWeek = (w: AssignmentWeek<AssignmentEntry>) => {
    const opened = isOpen(w);
    const current = w.kind === 'current';
    const label = LABEL[w.kind];
    const panel = `week-${w.key}`;
    return (
      <section key={w.key} className="space-y-3">
        <Button variant="hubLink" type="button" onClick={() => toggle(w)} aria-expanded={opened} aria-controls={panel}
          className={`h-auto whitespace-normal justify-start w-full text-left rounded-lg px-5 py-4 flex flex-wrap items-center gap-3 transition ${current ? pink : w.kind === 'upcoming' ? coming : gray}`}>
          <CalendarDays className="w-6 h-6 shrink-0" />
          <div className="min-w-0">
            {label ? (
              <>
                <h3 className="text-xl font-extrabold leading-tight">{label}</h3>
                <p className="text-sm font-semibold opacity-90">{w.range}</p>
              </>
            ) : (
              <h3 className="text-lg font-extrabold leading-tight">{w.range}</h3>
            )}
          </div>
          <span className="ml-auto flex items-center gap-3">
            {current && <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-hub-nav text-hub-indicator border border-hub-nav-border`}>Current</span>}
            <span className="text-xs font-semibold opacity-80">{w.items.length} {w.items.length === 1 ? 'assignment' : 'assignments'}</span>
            <ChevronDown className={`w-6 h-6 transition-transform ${opened ? 'rotate-180' : ''}`} />
          </span>
        </Button>
        {opened && (
          <div id={panel} className={`grid grid-cols-1 gap-4 ${w.kind === 'prior' || w.kind === 'last' ? 'opacity-90' : ''}`}>
            {w.items.length === 0 && (
              <p className={`rounded-lg px-5 py-4 text-sm ${card}`}>No assignments posted for this week yet.{nextUpcoming ? ' Your next lessons are listed under Coming Up.' : ''}</p>
            )}
            {w.items.map((a) => (
              <div key={a.key} className={`rounded-lg p-5 ${card}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge}`}>
                    <CalendarDays className="w-3.5 h-3.5" /> {dateBadge(a)}
                  </span>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${hc ? 'text-yellow-300' : 'text-[#E94928]'}`}>{a.focus}</span>
                </div>
                <h3 className={`mt-3 text-xl font-bold text-hub-nav-foreground`}>{a.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{a.description}</p>
                <Button variant="hubOutline" onClick={() => onOpen(a.tab)} className={`mt-4 ${btn}`}>
                  Open {a.title} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const currentAndUpcoming = [...weeks.filter((w) => w.kind === 'current'), ...weeks.filter((w) => w.kind === 'upcoming').reverse()];
  const prior = weeks.filter((w) => w.kind === 'last' || w.kind === 'prior');

  return (
    <div className="hub-surface space-y-5" data-contrast={hc}>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 text-hub-nav-foreground`}>
            Assignments
          </h2>
          <p className={`mt-1 text-sm ${muted}`}>Class assignments for MS Entrepreneurship (Grades 7 &amp; 8). Open a week to see its assignments, then open an assignment to complete it.</p>
        </div>
        <div role="tablist" aria-label="Assignments view" className={`ml-auto inline-flex rounded-lg p-1 bg-hub-nav-hover border border-hub-nav-border`}>
          {([['list', 'List', List], ['calendar', 'Calendar', CalendarDays]] as const).map(([id, label, Icon]) => (
            <Button variant="hubLink" key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition ${view === id ? 'bg-hub-nav border border-hub-nav-border text-hub-nav-foreground' : 'text-hub-nav-muted'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Button>
          ))}
        </div>
      </div>

      {view === 'calendar' ? (
        <AssignmentCalendar entries={entries} weeks={weeks} today={today} hc={hc} onOpen={onOpen} />
      ) : (
        <>
          <div className="space-y-3">
            <h3 className={groupTitle}>Current &amp; Coming Up</h3>
            {currentAndUpcoming.map(renderWeek)}
          </div>
          {prior.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className={groupTitle}>Prior Assignments</h3>
              {prior.map(renderWeek)}
            </div>
          )}
        </>
      )}

      <div className={`rounded-lg p-4 text-sm bg-hub-nav-hover text-hub-nav-muted`}>
        New assignments will appear here as they are given in class.
      </div>
    </div>
  );
}

function AssignmentCalendar({ entries, weeks, today, hc, onOpen }: { entries: AssignmentEntry[]; weeks: AssignmentWeek<AssignmentEntry>[]; today: Date; hc: boolean; onOpen: (tab: string) => void }) {
  const [month, setMonth] = useState(() => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const kindOf = new Map(weeks.map((w) => [w.key, w.kind]));
  const thisMonday = weekMonday(today).getTime();
  const first = weekMonday(month);
  const nextMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
  const rows: Date[] = [];
  for (let m = first; m < nextMonth; m = new Date(m.getTime() + 7 * DAY)) rows.push(m);
  const byDay = new Map<string, AssignmentEntry[]>();
  for (const e of entries) {
    const k = e.dateObj.toISOString().slice(0, 10);
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }
  const shift = (n: number) => setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + n, 1)));
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const navBtn = `p-2 rounded-lg border border-hub-nav-border text-hub-nav-foreground hover:bg-hub-nav-hover`;
  const weekTag = (monday: Date) => {
    const k = monday.toISOString().slice(0, 10);
    const t = monday.getTime();
    const kind = kindOf.get(k) ?? (t > thisMonday ? 'upcoming' : t === thisMonday ? 'current' : t === thisMonday - 7 * DAY ? 'last' : 'prior');
    return { kind, label: kind === 'current' ? 'This Week' : kind === 'upcoming' ? 'Coming Up' : kind === 'last' ? 'Last Week' : 'Prior' };
  };
  const tagClass = (kind: WeekKind) => kind === 'current' ? 'bg-hub-nav-hover text-hub-indicator' : 'bg-hub-nav-hover text-hub-nav-muted';

  return (
    <div className={`rounded-lg p-4 sm:p-5 hub-directory-card text-hub-nav-foreground`}>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="hubLink" onClick={() => shift(-1)} className={navBtn} aria-label="Previous month"><ChevronLeft className="w-5 h-5" /></Button>
        <h3 className="text-xl font-extrabold min-w-[11rem] text-center">{monthLabel}</h3>
        <Button variant="hubLink" onClick={() => shift(1)} className={navBtn} aria-label="Next month"><ChevronRight className="w-5 h-5" /></Button>
        <Button variant="hubLink" onClick={() => setMonth(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))} className={`ml-auto px-3 py-2 rounded-lg text-sm font-bold border border-hub-nav-border text-hub-nav-foreground hover:bg-hub-nav-hover`}>Today</Button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[8rem_repeat(5,1fr)] gap-1 text-xs font-bold uppercase tracking-wide opacity-70 mb-1">
            <div>Week</div>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => <div key={d} className="px-2">{d}</div>)}
          </div>
          {rows.map((monday) => {
            const { kind, label } = weekTag(monday);
            const isCurrent = kind === 'current';
            return (
              <div key={monday.toISOString()} className={`grid grid-cols-[8rem_repeat(5,1fr)] gap-1 mb-1 rounded-lg ${isCurrent ? 'ring-1 ring-hub-indicator/50' : ''}`}>
                <div className="p-2 flex flex-col justify-center">
                  <span className={`self-start px-2 py-0.5 rounded-full text-[11px] font-bold ${tagClass(kind)}`}>{label}</span>
                  <span className="mt-1 text-[11px] opacity-70">{monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – {new Date(monday.getTime() + 4 * DAY).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
                </div>
                {[0, 1, 2, 3, 4].map((i) => {
                  const day = new Date(monday.getTime() + i * DAY);
                  const k = day.toISOString().slice(0, 10);
                  const inMonth = day.getUTCMonth() === month.getUTCMonth();
                  const isToday = day.getTime() === today.getTime();
                  const list = byDay.get(k) ?? [];
                  return (
                    <div key={k} className={`min-h-[88px] rounded-lg p-1.5 bg-hub-nav-hover ${inMonth ? '' : 'opacity-45'}`}>
                      <div className={`text-xs font-bold mb-1 inline-flex w-6 h-6 items-center justify-center rounded-full ${isToday ? 'bg-hub-nav-hover text-hub-indicator' : ''}`}>{day.getUTCDate()}</div>
                      <div className="space-y-1">
                        {list.map((a) => (
                          <Button variant="hubLink" key={a.key} onClick={() => onOpen(a.tab)} title={`${a.title} — ${a.date}`}
                            className={`h-auto whitespace-normal justify-start w-full text-left text-xs font-semibold leading-snug rounded-md px-2 py-1 transition border border-hub-nav-border bg-hub-nav text-hub-nav-foreground hover:bg-hub-nav-hover`}>
                            {a.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs opacity-70">Click a lesson to open it. Multi-day assignments appear on their start date.</p>
    </div>
  );
}
