import { useEffect, useMemo, useState } from 'react';
import { Users, Trophy, BookOpen, RefreshCw, ClipboardList, Search, AlertTriangle, KeyRound, Check, Table, Trash2, Pencil, ShieldCheck } from 'lucide-react';
import { getClassProgress, resetStudentPassword, deleteStudent, renameStudent, type StudentRow } from '@/lib/teacher.functions';
import { LAUNCHPAD_CHAPTERS, ALL_LAUNCHPAD_SECTION_IDS } from '@/lib/launchpad-content';
import Gradebook from './Gradebook';
import TeacherMasteryPanels from './TeacherMasteryPanels';
import AssignmentInbox from './AssignmentInbox';
import { Inbox, FileUp } from 'lucide-react';
import LessonUploader from './LessonUploader';

type Props = { highContrast: boolean; totalScenarios?: number; totalTerms?: number; onOpenTab?: (tab: string) => void };

const SECTION_TITLES: Record<string, string> = Object.fromEntries(
  LAUNCHPAD_CHAPTERS.flatMap((chapter) =>
    chapter.sections.map((section) => [section.id, `${section.label} ${section.title}`]),
  ),
);

export default function TeacherDashboard({ highContrast, totalScenarios = 1, totalTerms = 1, onOpenTab }: Props) {
  const [view, setView] = useState<'progress' | 'mastery' | 'gradebook' | 'inbox' | 'upload'>('progress');
  const [newSubs, setNewSubs] = useState(0);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState<string | null>(null);
  const [removeFor, setRemoveFor] = useState<string | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [renameFor, setRenameFor] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameBusy, setRenameBusy] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const submitRename = async (userId: string) => {
    setRenameBusy(true);
    setRenameError(null);
    try {
      await renameStudent({ data: { userId, name: renameValue } });
      const clean = renameValue.trim().replace(/\s+/g, ' ');
      setRows((prev) => prev.map((r) => (r.userId === userId ? { ...r, name: clean } : r)));
      setRenameFor(null);
      setRenameValue('');
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Could not rename that student.');
    } finally {
      setRenameBusy(false);
    }
  };


  const submitRemove = async (userId: string) => {
    setRemoveBusy(true);
    setRemoveError(null);
    try {
      await deleteStudent({ data: { userId } });
      setRows((prev) => prev.filter((r) => r.userId !== userId));
      setRemoveFor(null);
      setOpenStudent(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Could not remove that student.');
    } finally {
      setRemoveBusy(false);
    }
  };


  const submitReset = async (userId: string) => {
    setResetBusy(true);
    setResetError(null);
    try {
      await resetStudentPassword({ data: { userId, newPassword } });
      setResetDone(userId);
      setResetFor(null);
      setNewPassword('');
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Could not reset that password.');
    } finally {
      setResetBusy(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClassProgress();
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load class progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q));
  }, [rows, query]);

  const totals = useMemo(
    () => ({
      students: rows.length,
      xp: rows.reduce((sum, row) => sum + row.xp, 0),
      sections: rows.reduce((sum, row) => sum + row.sectionsDone, 0),
      notes: rows.reduce((sum, row) => sum + row.notes.length, 0),
    }),
    [rows],
  );

  const card = highContrast
    ? 'bg-zinc-900 border-2 border-yellow-400 text-white'
    : 'bg-white border border-[#414042]/12 text-[#414042]';
  const heading = highContrast ? 'text-yellow-300' : 'text-[#414042]';
  const muted = highContrast ? 'text-yellow-200' : 'text-[#414042]/70';
  const totalSections = ALL_LAUNCHPAD_SECTION_IDS.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${heading}`}>
            <Users className={highContrast ? 'text-yellow-300' : 'text-[#C51C63]'} />
            Teacher Dashboard
          </h2>
          <p className={`text-sm ${muted}`}>Class progress for every student who has signed in — XP, completed sections and their section notes.</p>
        </div>
        <button
          onClick={load}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition ${
            highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042] text-white hover:bg-[#414042]/90'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className={`rounded-xl p-4 text-sm flex items-start gap-2 ${
          highContrast ? 'bg-zinc-900 border-2 border-yellow-400 text-yellow-200' : 'bg-[#E94928]/10 border border-[#E94928]/30 text-[#414042]'
        }`}>
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {([
          { id: 'progress' as const, label: 'Class Roster', icon: Users },
          { id: 'mastery' as const, label: 'Mastery & XP', icon: ShieldCheck },
          { id: 'gradebook' as const, label: 'Gradebook', icon: Table },
          { id: 'inbox' as const, label: 'Assignment Inbox', icon: Inbox },
          { id: 'upload' as const, label: 'Lesson Upload', icon: FileUp },
        ]).map((tab) => (

          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              view === tab.id
                ? highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-[#C51C63] text-white'
                : highContrast
                  ? 'border-2 border-yellow-400 text-yellow-200'
                  : 'border border-[#414042]/20 text-[#414042] hover:bg-[#414042]/5'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
            {tab.id === 'inbox' && newSubs > 0 && <span className="ml-1 px-1.5 rounded-full bg-[#EFA835] text-[#414042] text-xs">{newSubs}</span>}
          </button>
        ))}
      </div>

      <div className={view === 'inbox' ? '' : 'hidden'}><AssignmentInbox highContrast={highContrast} roster={rows} onNewCount={setNewSubs} /></div>
      {view === 'inbox' ? null : view === 'upload' ? (
        <LessonUploader highContrast={highContrast} onOpenLesson={onOpenTab} />
      ) : view === 'mastery' ? (

        <TeacherMasteryPanels highContrast={highContrast} />
      ) : view === 'gradebook' ? (
        <Gradebook rows={filtered} highContrast={highContrast} totalScenarios={totalScenarios} totalTerms={totalTerms} />
      ) : (

      <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Students signed in', value: totals.students },
          { icon: Trophy, label: 'Total class XP', value: totals.xp },
          { icon: BookOpen, label: 'Sections completed', value: totals.sections },
          { icon: ClipboardList, label: 'Notes written', value: totals.notes },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${card}`}>
            <stat.icon className={`w-5 h-5 mb-2 ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`} />
            <div className="text-2xl font-black">{stat.value}</div>
            <div className={`text-xs ${muted}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className={`rounded-xl p-4 ${card}`}>
        <label className="flex items-center gap-2 text-sm">
          <Search className={`w-4 h-4 ${muted}`} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by student name or email"
            className={`w-full bg-transparent outline-none ${highContrast ? 'placeholder:text-yellow-200/60' : 'placeholder:text-[#414042]/40'}`}
          />
        </label>
      </div>

      {loading && rows.length === 0 ? (
        <p className={`text-sm ${muted}`}>Loading class progress…</p>
      ) : filtered.length === 0 ? (
        <p className={`text-sm ${muted}`}>No students to show yet. Progress appears here once students sign in and start working.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const open = openStudent === row.userId;
            return (
              <div key={row.userId} className={`rounded-xl overflow-hidden ${card}`}>
                <button
                  onClick={() => setOpenStudent(open ? null : row.userId)}
                  className="w-full text-left px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold">{row.name}</div>
                    <div className={`text-xs ${muted}`}>{row.email || 'no email on file'}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span><strong>{row.xp}</strong> <span className={muted}>XP</span></span>
                    <span><strong>{row.sectionsDone}</strong>/{totalSections} <span className={muted}>sections</span></span>
                    <span><strong>{row.masteredCount}</strong> <span className={muted}>terms</span></span>
                    <span><strong>{row.scenariosCount}</strong> <span className={muted}>scenarios</span></span>
                    <span className={`text-xs ${muted}`}>{row.notes.length} notes</span>
                  </div>
                </button>
                {open && (
                  <div className={`px-4 pb-4 space-y-2 text-sm ${highContrast ? 'border-t-2 border-yellow-400' : 'border-t border-[#414042]/10'}`}>
                    {row.notes.length === 0 ? (
                      <p className={`pt-3 ${muted}`}>This student has not written any section notes yet.</p>
                    ) : (
                      row.notes.map((note) => (
                        <div key={note.sectionId} className="pt-3">
                          <div className={`text-xs font-bold ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`}>
                            {SECTION_TITLES[note.sectionId] || note.sectionId}
                          </div>
                          <p className="whitespace-pre-wrap">{note.note}</p>
                        </div>
                      ))
                    )}
                    {row.updatedAt && (
                      <p className={`pt-2 text-xs ${muted}`}>Last activity: {new Date(row.updatedAt).toLocaleString()}</p>
                    )}

                    <div className={`pt-3 ${highContrast ? 'border-t-2 border-yellow-400' : 'border-t border-[#414042]/10'}`}>
                      {resetFor === row.userId ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold">New password for {row.name}</label>
                          <input
                            type="text"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="At least 6 characters"
                            className={`w-full sm:w-72 px-3 py-2 rounded-lg outline-none ${
                              highContrast
                                ? 'bg-black border-2 border-yellow-400 text-yellow-100'
                                : 'bg-white border border-[#414042]/25 text-[#414042]'
                            }`}
                          />
                          <p className={`text-xs ${muted}`}>
                            Write it down and hand it to the student — then have them change it after signing in.
                          </p>
                          {resetError && (
                            <p className={`text-xs font-bold ${highContrast ? 'text-yellow-300' : 'text-[#E94928]'}`}>{resetError}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => submitReset(row.userId)}
                              disabled={resetBusy || newPassword.length < 6}
                              className={`px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 ${
                                highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'
                              }`}
                            >
                              {resetBusy ? 'Saving…' : 'Set new password'}
                            </button>
                            <button
                              onClick={() => {
                                setResetFor(null);
                                setNewPassword('');
                                setResetError(null);
                              }}
                              className={`px-3 py-2 rounded-lg text-xs font-bold ${
                                highContrast ? 'border-2 border-yellow-400 text-yellow-200' : 'border border-[#414042]/25 text-[#414042]'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => {
                              setResetFor(row.userId);
                              setResetError(null);
                              setResetDone(null);
                              setNewPassword('');
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${
                              highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042] text-white hover:bg-[#414042]/90'
                            }`}
                          >
                            <KeyRound className="w-4 h-4" /> Reset password
                          </button>
                          {removeFor === row.userId ? (
                            <>
                              <span className={`text-xs font-bold ${highContrast ? 'text-yellow-200' : 'text-[#414042]'}`}>
                                Remove {row.name} and all of their saved work?
                              </span>
                              <button
                                onClick={() => submitRemove(row.userId)}
                                disabled={removeBusy}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-60 ${
                                  highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" /> {removeBusy ? 'Removing...' : 'Yes, remove'}
                              </button>
                              <button
                                onClick={() => {
                                  setRemoveFor(null);
                                  setRemoveError(null);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                                  highContrast ? 'border-yellow-300 text-yellow-200' : 'border-[#414042]/30 text-[#414042]'
                                }`}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setRemoveFor(row.userId);
                                setRemoveError(null);
                              }}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${
                                highContrast
                                  ? 'border-yellow-300 text-yellow-200'
                                  : 'border-[#C51C63] text-[#C51C63] hover:bg-[#C51C63]/10'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" /> Remove student
                            </button>
                          )}
                          {renameFor === row.userId ? (
                            <>
                              <input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                placeholder="Maya R. (Grade 7)"
                                className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                                  highContrast
                                    ? 'bg-black text-yellow-200 border-yellow-300'
                                    : 'bg-white text-[#414042] border-[#414042]/30'
                                }`}
                              />
                              <button
                                onClick={() => submitRename(row.userId)}
                                disabled={renameBusy}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-60 ${
                                  highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042] text-white hover:bg-[#414042]/90'
                                }`}
                              >
                                <Check className="w-4 h-4" /> {renameBusy ? 'Saving...' : 'Save name'}
                              </button>
                              <button
                                onClick={() => {
                                  setRenameFor(null);
                                  setRenameError(null);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                                  highContrast ? 'border-yellow-300 text-yellow-200' : 'border-[#414042]/30 text-[#414042]'
                                }`}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setRenameFor(row.userId);
                                setRenameValue(row.name);
                                setRenameError(null);
                              }}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${
                                highContrast
                                  ? 'border-yellow-300 text-yellow-200'
                                  : 'border-[#414042]/30 text-[#414042] hover:bg-[#414042]/10'
                              }`}
                            >
                              <Pencil className="w-4 h-4" /> Rename student
                            </button>
                          )}
                          {renameError && renameFor === row.userId && (
                            <span className="text-xs font-bold text-red-600">{renameError}</span>
                          )}
                          {removeError && removeFor === row.userId && (
                            <span className="text-xs font-bold text-red-600">{removeError}</span>
                          )}
                          {resetDone === row.userId && (
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`}>
                              <Check className="w-4 h-4" /> Password updated
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
}
