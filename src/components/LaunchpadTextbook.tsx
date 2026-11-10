// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, CheckCircle2, Circle, ChevronDown, Volume2, Sparkles, Lightbulb,
  Layers, Calculator, Presentation, Target, Save, LogIn, Wrench, GraduationCap,
} from 'lucide-react';
import {
  LAUNCHPAD_CHAPTERS, TOOLKIT_REFERENCE, FINANCE_REFERENCE, SCAMPER_MOVES,
  ALL_LAUNCHPAD_SECTION_IDS,
} from '@/lib/launchpad-content';
import { PAGES_BY_CHAPTER } from '@/lib/textbook-pages';

export default function LaunchpadTextbook({ highContrast, speakText, auth, onEarnXp, targetSectionId, onSectionOpen, onSectionComplete }) {
  const { user, displayName, progress, saveSection, signIn, syncing } = auth;
  const [view, setView] = useState('ch1'); // chapter id | 'vocab' | 'tools' | 'reference'
  const [openSection, setOpenSection] = useState('ch1-1');
  const [openPage, setOpenPage] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});

  useEffect(() => {
    if (!targetSectionId) return;
    const targetChapter = LAUNCHPAD_CHAPTERS.find((item) =>
      item.sections.some((section) => section.id === targetSectionId),
    );
    if (!targetChapter) return;
    if (!progress[targetSectionId]) {
      saveSection(targetSectionId, { completed: false, notes: '' });
    }
    setView(targetChapter.id);
    setOpenSection(targetSectionId);
    onSectionOpen?.(targetSectionId);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`launchpad-${targetSectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [targetSectionId]);

  const completedCount = useMemo(
    () => ALL_LAUNCHPAD_SECTION_IDS.filter((id) => progress[id]?.completed).length,
    [progress],
  );
  const percent = Math.round((completedCount / ALL_LAUNCHPAD_SECTION_IDS.length) * 100);

  const card = highContrast
    ? 'bg-zinc-900 border-2 border-white text-white'
    : 'bg-white border border-[#414042]/15 text-[#414042]';
  const muted = highContrast ? 'text-yellow-200' : 'text-[#414042]/70';

  const navItem = (id, label, active, accent) => (
    <button
      key={id}
      onClick={() => setView(id)}
      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
        active
          ? highContrast
            ? 'bg-yellow-400 text-black font-extrabold'
            : 'text-white shadow-md'
          : highContrast
            ? 'text-white hover:bg-zinc-800 border border-white/30'
            : 'text-[#414042] hover:bg-[#414042]/5 border border-[#414042]/10'
      }`}
      style={active && !highContrast ? { backgroundColor: accent || '#C51C63' } : undefined}
    >
      {label}
    </button>
  );

  const toggleComplete = (sectionId) => {
    const current = progress[sectionId] || { completed: false, notes: '' };
    const nextCompleted = !current.completed;
    saveSection(sectionId, { ...current, completed: nextCompleted });
    // XP for finishing a section runs through the anti-farming rules: it needs
    // real reading time plus a saved note or an answered check.
    if (nextCompleted) {
      const hasEvidence = Boolean((noteDrafts[sectionId] ?? current.notes ?? '').trim());
      if (onSectionComplete) onSectionComplete(sectionId, hasEvidence);
      else if (onEarnXp) onEarnXp(3);
    }
  };

  const saveNotes = (sectionId) => {
    const current = progress[sectionId] || { completed: false, notes: '' };
    saveSection(sectionId, { ...current, notes: noteDrafts[sectionId] ?? current.notes });
  };

  const chapter = LAUNCHPAD_CHAPTERS.find((c) => c.id === view);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div
        className={`rounded-3xl p-6 md:p-8 ${
          highContrast ? 'bg-zinc-900 border-2 border-yellow-400' : 'bg-[#414042] text-white'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EFA835]">
              <GraduationCap className="w-4 h-4" /> Digital Textbook
            </div>
            <h2 className="mt-2 text-2xl md:text-4xl font-extrabold">LaunchPad Student Portal</h2>
            <p className={`mt-2 max-w-2xl text-sm md:text-base ${highContrast ? 'text-yellow-100' : 'text-white/80'}`}>
              Six chapters, case studies, vocabulary, and interactive tools — the full LaunchPad
              middle school entrepreneurship course in one place.
            </p>
          </div>
          <div className={`rounded-2xl p-4 min-w-[210px] ${highContrast ? 'bg-black border-2 border-white' : 'bg-white/10 border border-white/20'}`}>
            {user ? (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#EFA835]">Signed in</p>
                <p className="text-sm font-bold break-words">{displayName}</p>
                <p className="text-xs text-white/70">
                  {syncing ? 'Saving your progress…' : 'Progress saves automatically.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-[#EFA835]">Save your work</p>
                <button
                  onClick={signIn}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition ${
                    highContrast ? 'bg-yellow-400 text-black' : 'bg-white text-[#414042] hover:bg-white/90'
                  }`}
                >
                  <LogIn className="w-4 h-4" /> Sign in with Google
                </button>
                <p className="text-xs text-white/70">Until you sign in, notes stay on this device only.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>{completedCount} of {ALL_LAUNCHPAD_SECTION_IDS.length} sections complete</span>
            <span>{percent}%</span>
          </div>
          <div className={`mt-1.5 h-3 rounded-full overflow-hidden ${highContrast ? 'bg-black border border-white' : 'bg-white/20'}`}>
            <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: '#EFA835' }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* CHAPTER NAV */}
        <aside className={`rounded-2xl p-3 space-y-1.5 h-fit ${card}`}>
          <p className={`px-2 pt-1 pb-2 text-xs font-bold uppercase tracking-wide ${muted}`}>Chapters</p>
          {LAUNCHPAD_CHAPTERS.map((c) =>
            navItem(c.id, `${c.number}. ${c.title}`, view === c.id, c.color),
          )}
          <p className={`px-2 pt-3 pb-2 text-xs font-bold uppercase tracking-wide ${muted}`}>Study & Tools</p>
          {navItem('vocab', 'Vocabulary Bank', view === 'vocab', '#C51C63')}
          {navItem('tools', 'Interactive Tools', view === 'tools', '#E94928')}
          {navItem('reference', 'Toolkit & Formulas', view === 'reference', '#EFA835')}
        </aside>

        {/* CONTENT */}
        <main className="space-y-5">
          {chapter && (
            <>
              <div className={`rounded-2xl p-5 ${card}`} style={highContrast ? undefined : { borderTop: `6px solid ${chapter.color}` }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: highContrast ? '#FDE047' : chapter.color }}>
                  Chapter {chapter.number}
                </p>
                <h3 className="mt-1 text-xl md:text-2xl font-extrabold">{chapter.title}</h3>
                <p className={`mt-2 text-sm ${muted}`}>{chapter.summary}</p>
                <button
                  onClick={() => speakText(`Chapter ${chapter.number}. ${chapter.title}. ${chapter.summary}`, `lp-${chapter.id}`)}
                  className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042] text-white hover:bg-[#414042]/90'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                </button>
              </div>

              {/* Chapter vocabulary */}
              <div className={`rounded-2xl p-5 ${card}`}>
                <h4 className="flex items-center gap-2 font-extrabold">
                  <BookOpen className="w-4 h-4" style={{ color: chapter.color }} /> Key Vocabulary
                </h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {chapter.vocab.map((v) => (
                    <div
                      key={v.term}
                      className={`rounded-xl p-3 text-sm ${
                        highContrast ? 'bg-black border border-white' : 'bg-[#414042]/5'
                      }`}
                    >
                      <p className="font-bold">{v.term}</p>
                      <p className={muted}>{v.def}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full textbook reading pages */}
              {(PAGES_BY_CHAPTER[chapter.id] || []).map((page) => {
                const isOpen = openPage === page.id;
                return (
                  <div key={page.id} className={`rounded-2xl overflow-hidden ${card}`}>
                    <button
                      onClick={() => setOpenPage(isOpen ? null : page.id)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left"
                    >
                      <span>
                        <span className="text-xs font-bold" style={{ color: highContrast ? '#FDE047' : chapter.color }}>
                           LAUNCHPAD TEXTBOOK · {page.minutes} min read
                        </span>
                        <span className="block font-bold">{page.title}</span>
                        <span className={`block text-xs ${muted}`}>Big question: {page.bigQuestion}</span>
                      </span>
                      <ChevronDown className={`w-5 h-5 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className={`px-4 pb-5 space-y-4 border-t ${highContrast ? 'border-white/40' : 'border-[#414042]/10'}`}>
                        <div className="pt-4 space-y-3 text-sm leading-relaxed">
                          {page.paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                          <button
                            onClick={() => speakText(page.paragraphs.join(' '), `lp-page-${page.id}`)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                              highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042]/10 text-[#414042]'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                          </button>
                        </div>

                        <div
                          className={`rounded-xl p-4 text-sm ${
                            highContrast ? 'bg-black border-2 border-yellow-400' : 'bg-[#EFA835]/15 border border-[#EFA835]/40'
                          }`}
                        >
                          <p className="flex items-center gap-2 font-extrabold">
                            <Sparkles className="w-4 h-4" style={{ color: '#EFA835' }} /> Key Idea
                          </p>
                          <p className="mt-1.5">{page.keyIdea}</p>
                        </div>

                        {page.mindsetPractice?.length > 0 && (
                          <div
                            className={`rounded-xl p-4 text-sm space-y-2 ${
                              highContrast ? 'bg-black border-2 border-yellow-400' : 'bg-[#C51C63]/10 border border-[#C51C63]/25'
                            }`}
                          >
                            <p className="flex items-center gap-2 font-extrabold">
                              <Lightbulb className="w-4 h-4" style={{ color: highContrast ? '#FDE047' : '#C51C63' }} /> Entrepreneurial Mindset Practice
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                              {page.mindsetPractice.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div
                          className={`rounded-xl p-4 text-sm space-y-2 ${
                            highContrast ? 'bg-black border-2 border-white' : 'bg-[#414042]/5 border border-[#414042]/15'
                          }`}
                        >
                          <p className="font-extrabold">
                            Case Study: {page.caseStudy.name}
                            <span className={`block text-xs font-normal ${muted}`}>{page.caseStudy.subtitle}</span>
                          </p>
                          {page.caseStudy.body.map((b, i) => (
                            <p key={i} className="leading-relaxed">{b}</p>
                          ))}
                          <div className="pt-1">
                            <p className="text-xs font-bold uppercase tracking-wide">Discussion Questions</p>
                            <ol className="mt-1 list-decimal pl-5 space-y-1">
                              {page.caseStudy.questions.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ol>
                          </div>
                          <button
                            onClick={() =>
                              speakText(
                                `${page.caseStudy.name}. ${page.caseStudy.body.join(' ')}`,
                                `lp-case-${page.id}`,
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                              highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042]/10 text-[#414042]'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Read Case Study
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}



              {/* Sections */}
              {chapter.sections.map((section) => {
                const isOpen = openSection === section.id;
                const state = progress[section.id] || { completed: false, notes: '' };
                const draft = noteDrafts[section.id] ?? state.notes ?? '';
                return (
                  <div id={`launchpad-${section.id}`} key={section.id} className={`scroll-mt-24 rounded-2xl overflow-hidden ${card}`}>
                    <button
                      onClick={() => {
                        if (!progress[section.id]) saveSection(section.id, { completed: false, notes: '' });
                        onSectionOpen?.(section.id);
                        setOpenSection(isOpen ? null : section.id);
                      }}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left"
                    >
                      <span className="flex items-center gap-3">
                        {state.completed ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: highContrast ? '#FDE047' : '#2E7D6F' }} />
                        ) : (
                          <Circle className={`w-5 h-5 ${muted}`} />
                        )}
                        <span>
                          <span className="text-xs font-bold" style={{ color: highContrast ? '#FDE047' : chapter.color }}>
                            {section.label}
                          </span>
                          <span className="block font-bold">{section.title}</span>
                        </span>
                      </span>
                      <ChevronDown className={`w-5 h-5 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className={`px-4 pb-5 space-y-4 border-t ${highContrast ? 'border-white/40' : 'border-[#414042]/10'}`}>
                        {section.reading.length > 0 && (
                          <div className="pt-4 space-y-3 text-sm leading-relaxed">
                            {section.reading.map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                            <button
                              onClick={() => speakText(section.reading.join(' '), `lp-read-${section.id}`)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042]/10 text-[#414042] hover:bg-[#414042]/20'
                              }`}
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Read this section
                            </button>
                          </div>
                        )}

                        {section.caseStudies?.map((cs) => (
                          <div
                            key={cs.name}
                            className={`rounded-xl p-4 text-sm ${
                              highContrast ? 'bg-black border border-yellow-400' : 'bg-[#EFA835]/12 border border-[#EFA835]/40'
                            }`}
                          >
                            <p className="flex items-center gap-2 font-extrabold">
                              <Sparkles className="w-4 h-4" style={{ color: '#EFA835' }} /> {cs.name}
                            </p>
                            <p className="mt-1.5">{cs.body}</p>
                          </div>
                        ))}

                        {section.takeaway && (
                          <div
                            className={`rounded-xl p-4 text-sm ${
                              highContrast ? 'bg-black border border-white' : 'bg-[#2E7D6F]/10 border border-[#2E7D6F]/30'
                            }`}
                          >
                            <p className="font-bold">Takeaway</p>
                            <p className="mt-1">{section.takeaway}</p>
                          </div>
                        )}

                        {section.activity && (
                          <div
                            className={`rounded-xl p-4 text-sm ${
                              highContrast ? 'bg-black border border-white' : 'bg-[#C51C63]/8 border border-[#C51C63]/30'
                            }`}
                          >
                            <p className="flex items-center gap-2 font-extrabold">
                              <Target className="w-4 h-4" style={{ color: '#C51C63' }} /> {section.activity.heading}
                            </p>
                            <p className="mt-1.5">{section.activity.body}</p>
                          </div>
                        )}

                        {section.check && (
                          <div
                            className={`rounded-xl p-4 text-sm ${
                              highContrast ? 'bg-black border border-white' : 'bg-[#E94928]/8 border border-[#E94928]/30'
                            }`}
                          >
                            <p className="flex items-center gap-2 font-extrabold">
                              <Lightbulb className="w-4 h-4" style={{ color: '#E94928' }} /> Check Your Understanding
                            </p>
                            <p className="mt-1.5">{section.check}</p>
                          </div>
                        )}

                        {/* Student notes */}
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wide" htmlFor={`notes-${section.id}`}>
                            My Notes
                          </label>
                          <textarea
                            id={`notes-${section.id}`}
                            value={draft}
                            onChange={(e) => setNoteDrafts((d) => ({ ...d, [section.id]: e.target.value }))}
                            rows={4}
                            placeholder="Write your answers, ideas, and evidence here…"
                            className={`mt-1.5 w-full rounded-xl p-3 text-sm ${
                              highContrast
                                ? 'bg-black text-white border-2 border-white placeholder:text-white/50'
                                : 'bg-white border border-[#414042]/25 text-[#414042]'
                            }`}
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => saveNotes(section.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                                highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042] text-white hover:bg-[#414042]/90'
                              }`}
                            >
                              <Save className="w-3.5 h-3.5" /> Save Notes
                            </button>
                            <button
                              onClick={() => toggleComplete(section.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                                state.completed
                                  ? highContrast ? 'bg-white text-black' : 'bg-[#2E7D6F] text-white'
                                  : highContrast ? 'bg-zinc-800 text-white border border-white' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {state.completed ? 'Completed' : 'Mark Complete (+15 XP)'}
                            </button>
                            {!user && (
                              <span className={`self-center text-xs ${muted}`}>Sign in to save across devices.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {view === 'vocab' && <VocabularyBank highContrast={highContrast} card={card} muted={muted} />}
          {view === 'tools' && <InteractiveTools highContrast={highContrast} card={card} muted={muted} />}
          {view === 'reference' && <ReferenceShelf highContrast={highContrast} card={card} muted={muted} />}
        </main>
      </div>
    </div>
  );
}

function VocabularyBank({ highContrast, card, muted }) {
  const [query, setQuery] = useState('');
  const [flipped, setFlipped] = useState({});
  const terms = useMemo(() => {
    const all = LAUNCHPAD_CHAPTERS.flatMap((c) =>
      c.vocab.map((v) => ({ ...v, chapter: c.number, color: c.color })),
    );
    const q = query.trim().toLowerCase();
    return q ? all.filter((t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)) : all;
  }, [query]);

  return (
    <div className={`rounded-2xl p-5 ${card}`}>
      <h3 className="flex items-center gap-2 text-xl font-extrabold">
        <Layers className="w-5 h-5" style={{ color: '#C51C63' }} /> Vocabulary Bank
      </h3>
      <p className={`mt-1 text-sm ${muted}`}>Tap a card to flip between the term and its definition.</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search terms…"
        className={`mt-3 w-full rounded-xl p-3 text-sm ${
          highContrast ? 'bg-black text-white border-2 border-white' : 'bg-white border border-[#414042]/25'
        }`}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {terms.map((t) => {
          const isFlipped = !!flipped[t.term];
          return (
            <button
              key={t.term}
              onClick={() => setFlipped((f) => ({ ...f, [t.term]: !f[t.term] }))}
              className={`text-left rounded-xl p-4 min-h-[120px] transition ${
                highContrast ? 'bg-black border-2 border-white text-white' : 'bg-white border shadow-sm hover:shadow-md'
              }`}
              style={highContrast ? undefined : { borderColor: `${t.color}55` }}
            >
              <span className="text-xs font-bold" style={{ color: highContrast ? '#FDE047' : t.color }}>
                Chapter {t.chapter}
              </span>
              <p className="mt-1 font-extrabold">{t.term}</p>
              <p className={`mt-1 text-sm ${isFlipped ? '' : 'italic opacity-60'}`}>
                {isFlipped ? t.def : 'Tap to reveal the definition'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReferenceShelf({ card, muted }) {
  return (
    <div className="space-y-5">
      <div className={`rounded-2xl p-5 ${card}`}>
        <h3 className="flex items-center gap-2 text-xl font-extrabold">
          <Wrench className="w-5 h-5" style={{ color: '#E94928' }} /> Entrepreneurship Toolkit
        </h3>
        <div className="mt-3 space-y-2">
          {TOOLKIT_REFERENCE.map((t) => (
            <div key={t.name} className="text-sm">
              <p className="font-bold">{t.name}</p>
              <p className={muted}>{t.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={`rounded-2xl p-5 ${card}`}>
        <h3 className="flex items-center gap-2 text-xl font-extrabold">
          <Calculator className="w-5 h-5" style={{ color: '#EFA835' }} /> Financial Quick Reference
        </h3>
        <div className="mt-3 space-y-2">
          {FINANCE_REFERENCE.map((t) => (
            <div key={t.name} className="text-sm">
              <p className="font-bold">{t.name}</p>
              <p className={muted}>{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteractiveTools({ highContrast, card, muted }) {
  const input = highContrast
    ? 'bg-black text-white border-2 border-white placeholder:text-white/50'
    : 'bg-white border border-[#414042]/25 text-[#414042]';

  // 5 Whys
  const [problem, setProblem] = useState('');
  const [whys, setWhys] = useState(['', '', '', '', '']);
  // HMW
  const [complaint, setComplaint] = useState('');
  const [who, setWho] = useState('');
  const [outcome, setOutcome] = useState('');
  // SCAMPER
  const [object, setObject] = useState('');
  const [scamper, setScamper] = useState({});
  // Break-even
  const [fixed, setFixed] = useState(135);
  const [price, setPrice] = useState(25);
  const [variable, setVariable] = useState(4);
  // Pitch
  const [pitch, setPitch] = useState({ hook: '', problem: '', solution: '', cta: '' });

  const contribution = Number(price) - Number(variable);
  const breakEven = contribution > 0 ? Math.ceil(Number(fixed) / contribution) : null;

  return (
    <div className="space-y-5">
      {/* 5 Whys */}
      <div className={`rounded-2xl p-5 ${card}`}>
        <h3 className="text-xl font-extrabold">5 Whys Root-Cause Finder</h3>
        <p className={`mt-1 text-sm ${muted}`}>Start with a symptom, then ask why five times.</p>
        <input
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="The problem I notice is…"
          className={`mt-3 w-full rounded-xl p-3 text-sm ${input}`}
        />
        <div className="mt-2 space-y-2">
          {whys.map((w, i) => (
            <input
              key={i}
              value={w}
              onChange={(e) => setWhys((list) => list.map((v, idx) => (idx === i ? e.target.value : v)))}
              placeholder={`Why #${i + 1}…`}
              className={`w-full rounded-xl p-3 text-sm ${input}`}
            />
          ))}
        </div>
        {whys[4] && (
          <p className={`mt-3 text-sm font-bold ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`}>
            Likely root cause: {whys[4]}
          </p>
        )}
      </div>

      {/* HMW */}
      <div className={`rounded-2xl p-5 ${card}`}>
        <h3 className="text-xl font-extrabold">How Might We Question Builder</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Complaint (lunch line is slow)" className={`rounded-xl p-3 text-sm ${input}`} />
          <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Who is affected (8th graders)" className={`rounded-xl p-3 text-sm ${input}`} />
          <input value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Better outcome (get lunch faster)" className={`rounded-xl p-3 text-sm ${input}`} />
        </div>
        {(who || outcome) && (
          <p className={`mt-3 rounded-xl p-3 text-sm font-bold ${highContrast ? 'bg-black border border-yellow-400 text-yellow-200' : 'bg-[#C51C63]/10 text-[#C51C63]'}`}>
            How might we help {who || 'our customers'} {outcome || '…'}?
            {complaint ? ` (Reframed from: "${complaint}")` : ''}
          </p>
        )}
      </div>

      {/* SCAMPER */}
      <div className={`rounded-2xl p-5 ${card}`}>
        <h3 className="text-xl font-extrabold">SCAMPER Studio</h3>
        <input
          value={object}
          onChange={(e) => setObject(e.target.value)}
          placeholder="Object or product I am redesigning…"
          className={`mt-3 w-full rounded-xl p-3 text-sm ${input}`}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SCAMPER_MOVES.map((m) => (
            <div key={m.move}>
              <p className="text-sm font-bold">{m.move}</p>
              <p className={`text-xs ${muted}`}>{m.prompt}</p>
              <input
                value={scamper[m.move] || ''}
                onChange={(e) => setScamper((s) => ({ ...s, [m.move]: e.target.value }))}
                placeholder={`My ${m.move.toLowerCase()} idea…`}
                className={`mt-1 w-full rounded-xl p-2.5 text-sm ${input}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Break-even */}
      <div className={`rounded-2xl p-5 ${card}`}>
        <h3 className="text-xl font-extrabold">Unit Economics & Break-Even</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-bold">
            Fixed / startup costs ($)
            <input type="number" value={fixed} onChange={(e) => setFixed(e.target.value)} className={`mt-1 w-full rounded-xl p-2.5 text-sm ${input}`} />
          </label>
          <label className="text-sm font-bold">
            Selling price per unit ($)
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 w-full rounded-xl p-2.5 text-sm ${input}`} />
          </label>
          <label className="text-sm font-bold">
            Variable cost per unit ($)
            <input type="number" value={variable} onChange={(e) => setVariable(e.target.value)} className={`mt-1 w-full rounded-xl p-2.5 text-sm ${input}`} />
          </label>
        </div>
        <div className={`mt-4 rounded-xl p-4 text-sm ${highContrast ? 'bg-black border border-yellow-400' : 'bg-[#EFA835]/12'}`}>
          <p>Unit contribution = ${Number(price).toFixed(2)} − ${Number(variable).toFixed(2)} = <strong>${contribution.toFixed(2)}</strong></p>
          <p className="mt-1">
            {breakEven
              ? <>Break-even = ${Number(fixed).toFixed(2)} ÷ ${contribution.toFixed(2)} = <strong>{breakEven} sales</strong> (rounded up)</>
              : 'Your price must be higher than your variable cost to ever break even.'}
          </p>
        </div>
      </div>

      {/* Pitch */}
      <div className={`rounded-2xl p-5 ${card}`}>
        <h3 className="flex items-center gap-2 text-xl font-extrabold">
          <Presentation className="w-5 h-5" style={{ color: '#7B1FA2' }} /> 60-Second Pitch Coach
        </h3>
        <div className="mt-3 space-y-2">
          {[
            ['hook', 'Hook — earn attention in one sentence'],
            ['problem', 'Problem — who struggles, and why current options fail'],
            ['solution', 'Solution — what you offer and the evidence you have'],
            ['cta', 'Call to Action — the next step you are asking for'],
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-bold">
              {label}
              <textarea
                rows={2}
                value={pitch[key]}
                onChange={(e) => setPitch((p) => ({ ...p, [key]: e.target.value }))}
                className={`mt-1 w-full rounded-xl p-3 text-sm font-normal ${input}`}
              />
            </label>
          ))}
        </div>
        {(pitch.hook || pitch.problem || pitch.solution || pitch.cta) && (
          <div className={`mt-3 rounded-xl p-4 text-sm ${highContrast ? 'bg-black border border-white' : 'bg-[#414042]/5'}`}>
            <p className="font-bold">My pitch draft</p>
            <p className="mt-1">{[pitch.hook, pitch.problem, pitch.solution, pitch.cta].filter(Boolean).join(' ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
