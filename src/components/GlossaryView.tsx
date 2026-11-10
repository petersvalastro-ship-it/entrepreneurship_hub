import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Plus, Search, Trash2, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GLOSSARY_CATEGORIES, glossaryKey, glossaryLetter, type GlossaryEntry } from '@/lib/glossary';

type Props = {
  terms: GlossaryEntry[];
  reloadTerms: () => Promise<void>;
  isTeacher: boolean;
  userId?: string | undefined;
  masteredTerms: string[];
  setMasteredTerms: (ids: string[]) => void;
  setXp: (fn: (prev: number) => number) => void;
  speakText: (text: string, id: string) => void;
  stopSpeech: () => void;
  currentSpeakingId: string | null;
  speechSynthesisActive: boolean;
  highContrast: boolean;
};
export default function GlossaryView({ terms, reloadTerms, isTeacher, userId, masteredTerms, setMasteredTerms, setXp, speakText, stopSpeech, currentSpeakingId, speechSynthesisActive, highContrast }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [studyMode, setStudyMode] = useState('list');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const categories = ['All', ...GLOSSARY_CATEGORIES];
  const [showAdd, setShowAdd] = useState(false);
  const categoryColor: Record<string, string> = {
    All: 'bg-[#414042] border-[#414042] text-white',
    'Financial Literacy': 'bg-[#EFA835] border-[#EFA835] text-white',
    Entrepreneurship: 'bg-[#E94928] border-[#E94928] text-white',
    'Entrepreneurial Mindset': 'bg-[#C51C63] border-[#C51C63] text-white',
    'Customer & Design': 'bg-[#2f7d6d] border-[#2f7d6d] text-white',
    'Marketing & Pitch': 'bg-[#61249a] border-[#61249a] text-white',
  };

  const filteredTerms = useMemo(() => {
    return terms.filter((item) => {
      const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [terms, searchTerm, activeCategory]);

  const groups = useMemo(() => {
    const out: { letter: string; items: GlossaryEntry[] }[] = [];
    for (const item of filteredTerms) {
      const letter = glossaryLetter(item.term);
      const last = out[out.length - 1];
      if (last && last.letter === letter) last.items.push(item);
      else out.push({ letter, items: [item] });
    }
    return out;
  }, [filteredTerms]);
  const presentLetters = new Set(groups.map((g) => g.letter));

  const removeTerm = async (item: GlossaryEntry) => {
    if (!item.custom || !window.confirm(`Remove "${item.term}" from the glossary?`)) return;
    const { error } = await supabase.from('glossary_term').delete().eq('id', item.custom.id);
    if (error) { toast.error('Could not remove that term. Please try again.'); return; }
    toast.success(`Removed "${item.term}"`);
    await reloadTerms();
  };

  const toggleMastered = (id: string) => {
    if (masteredTerms.includes(id)) {
      setMasteredTerms(masteredTerms.filter((item) => item !== id));
      setXp((prev) => Math.max(0, prev - 15));
    } else {
      setMasteredTerms([...masteredTerms, id]);
      setXp((prev) => prev + 15);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        highContrast ? 'bg-zinc-900 border-2 border-yellow-400 text-white' : 'bg-[#414042]/5 border-[#414042]/10'
      }`}>
        <div>
          <h2 className={`text-2xl font-black flex items-center gap-2 ${highContrast ? 'text-white' : 'text-[#414042]'}`}>
            <BookOpen className={`w-6 h-6 ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`} /> Entrepreneur's Glossary A–Z
          </h2>
          <p className={`text-xs mt-1 ${highContrast ? 'text-zinc-200' : 'text-[#414042]/70'}`}>
            Every vocabulary word from the LaunchPad textbook, our assignments and case studies — {terms.length} terms, A to Z. Tap the audio button to hear any term.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        {isTeacher && (
          <button
            onClick={() => setShowAdd((v) => !v)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${highContrast ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-[#C51C63] text-white hover:bg-[#a8164f]'}`}
          >
            <Plus className="w-4 h-4" /> {showAdd ? 'Close' : 'Add Term'}
          </button>
        )}
        {/* View Toggle */}
        <div className={`flex p-1 rounded-xl border ${
          highContrast ? 'bg-black border-white' : 'bg-[#414042]/10 border-[#414042]/15'
        }`}>
          <button 
            onClick={() => { setStudyMode('list'); stopSpeech(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              studyMode === 'list' 
                ? highContrast ? 'bg-yellow-400 text-black font-extrabold' : 'bg-[#C51C63] text-white' 
                : highContrast ? 'text-white' : 'text-[#414042]'
            }`}
          >
            Dictionary List
          </button>
          <button 
            onClick={() => { setStudyMode('flashcards'); setCurrentCardIndex(0); setIsFlipped(false); stopSpeech(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              studyMode === 'flashcards' 
                ? highContrast ? 'bg-yellow-400 text-black font-extrabold' : 'bg-[#C51C63] text-white' 
                : highContrast ? 'text-white' : 'text-[#414042]'
            }`}
          >
            Flashcard Mode 🃏
          </button>
        </div>
        </div>
      </div>

      {isTeacher && showAdd && (
        <AddTermForm
          terms={terms}
          userId={userId}
          highContrast={highContrast}
          onAdded={async (term) => { await reloadTerms(); setShowAdd(false); setSearchTerm(''); setActiveCategory('All'); toast.success(`Added "${term}" to the glossary`); setTimeout(() => document.getElementById(`term-${term.toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); }}
        />
      )}

      {/* SEARCH BAR & CATEGORY FILTERS */}
      {studyMode === 'list' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3 top-3.5 ${highContrast ? 'text-yellow-300' : 'text-[#414042]/40'}`} />
            <input 
              type="text" 
              placeholder="Search terms like Assets, Liabilities, Profit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none shadow-xs ${
                highContrast 
                  ? 'bg-zinc-900 text-white border-2 border-white focus:border-yellow-400 placeholder-zinc-400 font-bold' 
                  : 'bg-white border border-[#414042]/20 text-[#414042] placeholder-[#414042]/40 focus:border-[#C51C63]'
              }`}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat 
                     ? highContrast 
                       ? 'bg-yellow-400 text-black border-2 border-white font-extrabold' 
                       : `${categoryColor[cat]} border` 
                    : highContrast 
                      ? 'bg-zinc-900 text-white border-2 border-white hover:border-yellow-400' 
                      : 'bg-white text-[#414042] border border-[#414042]/20 hover:border-[#C51C63]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DICTIONARY LIST */}
      {studyMode === 'list' && (
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
          {['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((L) => (
            <button
              key={L}
              disabled={!presentLetters.has(L)}
              onClick={() => document.getElementById(`letter-${L}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`w-8 h-8 rounded-lg text-xs font-black transition disabled:opacity-25 disabled:cursor-default ${highContrast ? 'bg-zinc-900 text-yellow-300 border-2 border-white' : 'bg-white text-[#C51C63] border border-[#414042]/15 hover:bg-[#C51C63] hover:text-white disabled:hover:bg-white disabled:hover:text-[#C51C63]'}`}
            >
              {L}
            </button>
          ))}
        </nav>
      )}

      {studyMode === 'list' && filteredTerms.length === 0 && (
        <p className={`text-sm text-center py-10 ${highContrast ? 'text-white' : 'text-[#414042]/70'}`}>No terms match your search.</p>
      )}

      {studyMode === 'list' && groups.map((group) => (
        <section key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-24 space-y-3">
          <h3 className={`text-2xl font-black border-b-2 pb-1 ${highContrast ? 'text-yellow-300 border-yellow-400' : 'text-[#C51C63] border-[#C51C63]/30'}`}>{group.letter}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {group.items.map((item) => {
            const isMastered = masteredTerms.includes(item.id);
            const isSpeakingThis = speechSynthesisActive && currentSpeakingId === item.id;
            return (
              <div 
                key={item.id} 
                id={`term-${item.term.toLowerCase()}`}
                className={`scroll-mt-24 p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 shadow-xs ${
                  highContrast 
                    ? 'bg-zinc-900 border-2 border-yellow-400 text-white' 
                    : isMastered 
                      ? 'bg-[#EFA835]/10 border-[#EFA835]' 
                      : 'bg-white border-[#414042]/15 hover:border-[#C51C63]/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 className={`font-bold text-lg ${highContrast ? 'text-yellow-300 font-black' : 'text-[#414042]'}`}>{item.term}</h3>
                         <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                           highContrast ? 'bg-yellow-400 text-black border-white' : categoryColor[item.category]
                        }`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (isSpeakingThis) {
                          stopSpeech();
                        } else {
                          speakText(`${item.term}. Definition: ${item.definition}. ${item.example ? 'Real-world Example: ' + item.example : ''}`, item.id);
                        }
                      }}
                      className={`p-2 rounded-xl border transition flex items-center gap-1.5 ${
                        highContrast
                          ? 'bg-zinc-800 text-white border-2 border-white hover:bg-zinc-700'
                          : isSpeakingThis 
                            ? 'bg-[#E94928] text-white border-[#E94928] animate-pulse font-bold' 
                            : 'bg-[#414042]/5 hover:bg-[#C51C63]/10 text-[#C51C63] border-[#414042]/15'
                      }`}
                      title={isSpeakingThis ? "Stop audio" : "Read aloud"}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          <span className="text-xs">Stop</span>
                        </>
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className={`text-sm mt-3 leading-relaxed ${highContrast ? 'text-white font-medium' : 'text-[#414042]'}`}>
                    {item.definition}
                  </p>

                  {item.formula && (
                    <div className={`mt-2 text-xs font-mono px-3 py-1.5 rounded-lg w-fit font-bold border ${
                      highContrast ? 'bg-black text-yellow-300 border-yellow-400' : 'bg-[#E94928]/10 text-[#E94928] border-[#E94928]/30'
                    }`}>
                      📐 {item.formula}
                    </div>
                  )}

                  {item.example && (
                  <div className={`mt-3 p-3 rounded-xl border text-xs ${
                    highContrast ? 'bg-black text-white border-white' : 'bg-[#414042]/5 border-[#414042]/10 text-[#414042]/90'
                  }`}>
                    <strong className={highContrast ? 'text-yellow-300' : 'text-[#E94928]'}>Real-World Example:</strong> {item.example}
                  </div>
                  )}
                  {item.seenIn && (
                    <p className={`mt-2 text-[11px] font-semibold ${highContrast ? 'text-zinc-300' : 'text-[#414042]/60'}`}>Found in: {item.seenIn}</p>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  {isTeacher && item.custom && (
                    <button onClick={() => removeTerm(item)} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${highContrast ? 'bg-zinc-800 text-white border-2 border-white' : 'bg-white text-[#414042]/70 border border-[#414042]/15 hover:text-[#C51C63]'}`} title="Remove this term">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                  <button 
                    onClick={() => toggleMastered(item.id)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      highContrast 
                        ? isMastered 
                          ? 'bg-yellow-400 text-black font-extrabold border-2 border-white' 
                          : 'bg-zinc-800 text-white border-2 border-white hover:bg-yellow-400 hover:text-black'
                        : isMastered 
                          ? 'bg-[#EFA835] text-[#414042] border border-[#EFA835]' 
                          : 'bg-[#414042]/10 text-[#414042] hover:bg-[#C51C63] hover:text-white border border-[#414042]/15'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isMastered ? 'Mastered (+15 XP)' : 'Mark as Learned'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </section>
      ))}

      {/* FLASHCARD INTERACTIVE MODE */}
      {studyMode === 'flashcards' && filteredTerms.length > 0 && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className={`text-center text-xs font-mono ${highContrast ? 'text-yellow-300 font-bold' : 'text-[#414042]/70'}`}>
            Card {currentCardIndex + 1} of {filteredTerms.length}
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className={`cursor-pointer min-h-[280px] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md transition relative ${
              highContrast 
                ? 'bg-zinc-900 border-4 border-yellow-400 text-white' 
                : 'bg-white border-2 border-[#C51C63] hover:border-[#E94928]'
            }`}
          >
            <span className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-mono font-semibold border ${
              highContrast ? 'bg-black text-yellow-300 border-yellow-400' : 'bg-[#414042]/5 text-[#414042] border-[#414042]/15'
            }`}>
              Click to Flip 🔄
            </span>

            {/* Read Aloud Button for Front and Back sides */}
            {(() => {
              const currentCard = filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!;
              const sideId = !isFlipped ? `flash-front-${currentCard.id}` : `flash-back-${currentCard.id}`;
              const isSpeakingSide = speechSynthesisActive && currentSpeakingId === sideId;
              
              const frontText = `${currentCard.term}. Category: ${currentCard.category}`;
              const backText = `Definition: ${currentCard.definition}. ${currentCard.formula ? 'Formula: ' + currentCard.formula + '.' : ''} ${currentCard.example ? 'Example: ' + currentCard.example : ''}`;
              
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSpeakingSide) {
                      stopSpeech();
                    } else {
                      speakText(!isFlipped ? frontText : backText, sideId);
                    }
                  }}
                  className={`absolute top-4 left-4 p-2 rounded-xl border text-xs flex items-center gap-1.5 transition z-10 ${
                    highContrast
                      ? 'bg-zinc-800 text-white border-2 border-white hover:bg-zinc-700'
                      : isSpeakingSide 
                        ? 'bg-[#E94928] text-white border-[#E94928] animate-pulse font-bold' 
                        : 'bg-[#414042]/5 hover:bg-[#C51C63]/10 text-[#C51C63] border-[#414042]/15'
                  }`}
                  title={isSpeakingSide ? "Stop audio" : !isFlipped ? "Read front of card" : "Read back of card"}
                >
                  {isSpeakingSide ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span className="font-semibold">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span className="font-semibold">{!isFlipped ? "Read Term" : "Read Definition"}</span>
                    </>
                  )}
                </button>
              );
            })()}

            {!isFlipped ? (
              <div className="space-y-3 pt-4">
                <span className="text-5xl">{filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!.icon}</span>
                <h3 className={`text-2xl font-extrabold ${highContrast ? 'text-white' : 'text-[#414042]'}`}>{filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!.term}</h3>
                <p className={`text-xs font-mono uppercase tracking-wider font-bold ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`}>{filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!.category}</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn pt-4">
                <p className={`text-base font-medium leading-relaxed ${highContrast ? 'text-white' : 'text-[#414042]'}`}>
                  "{filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!.definition}"
                </p>
                {filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!.formula && (
                  <div className={`text-xs font-mono px-3 py-1.5 rounded-lg border font-bold ${
                    highContrast ? 'bg-black text-yellow-300 border-white' : 'text-[#E94928] bg-[#E94928]/10 border-[#E94928]/30'
                  }`}>
                    {filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!.formula}
                  </div>
                )}
                <div className={`text-xs p-3 rounded-xl border ${
                  highContrast ? 'bg-black text-white border-yellow-400' : 'text-[#414042] bg-[#EFA835]/15 border-[#EFA835]/40'
                }`}>
                  Example: {filteredTerms[Math.min(currentCardIndex, filteredTerms.length - 1)]!.example || '—'}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3">
            <button 
              disabled={currentCardIndex === 0}
              onClick={() => { setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); stopSpeech(); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                highContrast 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 border-2 border-white' 
                  : 'bg-[#414042]/10 hover:bg-[#414042]/20 disabled:opacity-40 text-[#414042]'
              }`}
            >
              Previous Card
            </button>

            <button 
              disabled={currentCardIndex === filteredTerms.length - 1}
              onClick={() => { setCurrentCardIndex(prev => prev + 1); setIsFlipped(false); stopSpeech(); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                highContrast 
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold border-2 border-white disabled:opacity-40' 
                  : 'bg-[#C51C63] hover:bg-[#a81452] text-white'
              }`}
            >
              Next Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddTermForm({ terms, userId, highContrast, onAdded }: { terms: GlossaryEntry[]; userId?: string | undefined; highContrast: boolean; onAdded: (term: string) => void | Promise<void> }) {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [category, setCategory] = useState<string>('Entrepreneurship');
  const [saving, setSaving] = useState(false);
  const duplicate = term.trim() ? terms.find((t) => glossaryKey(t.term) === glossaryKey(term)) : undefined;
  const field = `w-full px-3 py-2 rounded-xl text-sm focus:outline-none ${highContrast ? 'bg-black text-white border-2 border-white focus:border-yellow-400' : 'bg-white border border-[#414042]/20 text-[#414042] focus:border-[#C51C63]'}`;
  const label = `block text-xs font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-[#414042]'}`;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim() || duplicate || !userId) return;
    setSaving(true);
    const { error } = await supabase.from('glossary_term').insert({
      term: term.trim(), definition: definition.trim(), example: example.trim(), category, created_by: userId,
    });
    setSaving(false);
    if (error) {
      toast.error(error.code === '23505' ? 'That term is already in the glossary.' : 'Could not save the term. Please try again.');
      return;
    }
    const saved = term.trim();
    setTerm(''); setDefinition(''); setExample('');
    await onAdded(saved);
  };

  return (
    <form onSubmit={save} className={`p-5 rounded-2xl border space-y-3 ${highContrast ? 'bg-zinc-900 border-2 border-yellow-400' : 'bg-white border-[#C51C63]/40 shadow-sm'}`}>
      <h3 className={`font-black text-lg ${highContrast ? 'text-white' : 'text-[#414042]'}`}>Add a Glossary Term</h3>
      <p className={`text-xs ${highContrast ? 'text-zinc-200' : 'text-[#414042]/70'}`}>New terms drop into their A–Z spot automatically. Only you can see this form.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="gl-term" className={label}>Term *</label>
          <input id="gl-term" className={field} value={term} maxLength={80} onChange={(e) => setTerm(e.target.value)} required />
          {duplicate && <p className="text-xs font-bold mt-1 text-[#E94928]">"{duplicate.term}" is already in the glossary.</p>}
        </div>
        <div>
          <label htmlFor="gl-cat" className={label}>Category</label>
          <select id="gl-cat" className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            {GLOSSARY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="gl-def" className={label}>Definition *</label>
        <textarea id="gl-def" className={field} rows={2} maxLength={600} value={definition} onChange={(e) => setDefinition(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="gl-ex" className={label}>Real-world example (optional)</label>
        <textarea id="gl-ex" className={field} rows={2} maxLength={400} value={example} onChange={(e) => setExample(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving || !term.trim() || !definition.trim() || !!duplicate} className={`px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#a8164f]'}`}>
          {saving ? 'Saving…' : 'Save Term'}
        </button>
      </div>
    </form>
  );
}
