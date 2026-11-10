import { useEffect, useMemo, useState } from 'react';
import { Download, Pencil, RotateCcw, Check } from 'lucide-react';
import {
  getGradeOverrides,
  saveGradeOverride,
  clearGradeOverride,
  type StudentRow,
  type GradeOverride,
} from '@/lib/teacher.functions';
import { LAUNCHPAD_CHAPTERS } from '@/lib/launchpad-content';

type Props = {
  rows: StudentRow[];
  highContrast: boolean;
  totalScenarios: number;
  totalTerms: number;
};

const XP_TARGET = 500;

// Weights used for the automatic overall grade.
const WEIGHTS = { chapters: 0.6, scenarios: 0.15, vocab: 0.15, xp: 0.1 };

const pct = (done: number, total: number) => (total <= 0 ? 0 : Math.round((done / total) * 100));

export default function Gradebook({ rows, highContrast, totalScenarios, totalTerms }: Props) {
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    getGradeOverrides()
      .then((list: GradeOverride[]) => {
        const next: Record<string, number> = {};
        for (const item of list) next[`${item.studentId}::${item.itemKey}`] = item.score;
        setOverrides(next);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load saved grades.'));
  }, []);

  const columns = useMemo(
    () => [
      ...LAUNCHPAD_CHAPTERS.map((chapter) => ({
        key: chapter.id,
        short: `Ch ${chapter.number}`,
        label: `Chapter ${chapter.number}: ${chapter.title}`,
        sectionIds: chapter.sections.map((section) => section.id),
      })),
      { key: 'scenarios', short: 'Scenarios', label: 'Math scenarios solved', sectionIds: [] as string[] },
      { key: 'vocab', short: 'Vocabulary', label: 'Glossary terms mastered', sectionIds: [] as string[] },
      { key: 'xp', short: 'XP', label: `XP earned (target ${XP_TARGET})`, sectionIds: [] as string[] },
    ],
    [],
  );

  const autoScore = (row: StudentRow, key: string) => {
    if (key === 'scenarios') return pct(row.scenariosCount, totalScenarios);
    if (key === 'vocab') return pct(row.masteredCount, totalTerms);
    if (key === 'xp') return Math.min(100, pct(row.xp, XP_TARGET));
    const chapter = LAUNCHPAD_CHAPTERS.find((item) => item.id === key);
    if (!chapter) return 0;
    const done = chapter.sections.filter((section) => row.completedSections.includes(section.id)).length;
    return pct(done, chapter.sections.length);
  };

  const score = (row: StudentRow, key: string) => {
    const manual = overrides[`${row.userId}::${key}`];
    return typeof manual === 'number' ? manual : autoScore(row, key);
  };

  const chapterAverage = (row: StudentRow) => {
    const values = LAUNCHPAD_CHAPTERS.map((chapter) => score(row, chapter.id));
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  const overall = (row: StudentRow) => {
    const manual = overrides[`${row.userId}::overall`];
    if (typeof manual === 'number') return manual;
    return Math.round(
      chapterAverage(row) * WEIGHTS.chapters +
        score(row, 'scenarios') * WEIGHTS.scenarios +
        score(row, 'vocab') * WEIGHTS.vocab +
        score(row, 'xp') * WEIGHTS.xp,
    );
  };

  const classAverage = (key: string) => {
    if (rows.length === 0) return 0;
    const values = rows.map((row) => (key === 'overall' ? overall(row) : score(row, key)));
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  const commit = async (studentId: string, itemKey: string) => {
    const value = Number(draft);
    setBusy(true);
    setError(null);
    try {
      await saveGradeOverride({ data: { studentId, itemKey, score: value } });
      setOverrides((prev) => ({ ...prev, [`${studentId}::${itemKey}`]: value }));
      setSaved(`${studentId}::${itemKey}`);
      setEditing(null);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that grade.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async (studentId: string, itemKey: string) => {
    setBusy(true);
    setError(null);
    try {
      await clearGradeOverride({ data: { studentId, itemKey } });
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[`${studentId}::${itemKey}`];
        return next;
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset that grade.');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const header = ['Student', ...columns.map((column) => column.short), 'Chapter average', 'Overall'];
    const body = rows.map((row) => [
      row.name,
      ...columns.map((column) => String(score(row, column.key))),
      String(chapterAverage(row)),
      String(overall(row)),
    ]);
    const csv = [header, ...body].map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'neia-gradebook.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const muted = highContrast ? 'text-yellow-200' : 'text-[#414042]/70';
  const cellBorder = highContrast ? 'border-yellow-400/40' : 'border-[#414042]/10';
  const headRow = highContrast ? 'bg-black text-yellow-300' : 'bg-[#414042] text-white';

  const gradeCell = (row: StudentRow, itemKey: string) => {
    const cellId = `${row.userId}::${itemKey}`;
    const manual = typeof overrides[cellId] === 'number';
    const value = itemKey === 'overall' ? overall(row) : score(row, itemKey);
    if (editing === cellId) {
      return (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="number"
            min={0}
            max={100}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit(row.userId, itemKey);
              if (event.key === 'Escape') setEditing(null);
            }}
            className={`w-16 px-2 py-1 rounded text-sm outline-none ${
              highContrast ? 'bg-black border-2 border-yellow-400 text-yellow-100' : 'bg-white border border-[#414042]/30 text-[#414042]'
            }`}
          />
          <button
            onClick={() => commit(row.userId, itemKey)}
            disabled={busy}
            className={`p-1 rounded disabled:opacity-50 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white'}`}
            aria-label="Save grade"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          {manual && (
            <button
              onClick={() => reset(row.userId, itemKey)}
              disabled={busy}
              className={`p-1 rounded disabled:opacity-50 ${highContrast ? 'border-2 border-yellow-400 text-yellow-200' : 'border border-[#414042]/25 text-[#414042]'}`}
              aria-label="Back to automatic grade"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }
    return (
      <button
        onClick={() => {
          setEditing(cellId);
          setDraft(String(value));
          setSaved(null);
        }}
        className="group inline-flex items-center gap-1 font-bold"
        title="Click to type your own grade"
      >
        <span className={manual ? (highContrast ? 'text-yellow-300 underline' : 'text-[#C51C63] underline') : ''}>{value}%</span>
        {saved === cellId ? <Check className="w-3 h-3" /> : <Pencil className={`w-3 h-3 opacity-0 group-hover:opacity-70 ${muted}`} />}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm ${muted}`}>
          Grades are worked out automatically from each student's finished textbook sections, solved scenarios, mastered
          vocabulary and XP. Click any grade to type your own — an underlined grade means you set it by hand. Use the
          undo arrow to go back to the automatic grade.
        </p>
        <button
          onClick={exportCsv}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${
            highContrast ? 'bg-yellow-400 text-black' : 'bg-[#414042] text-white hover:bg-[#414042]/90'
          }`}
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {error && (
        <p className={`text-sm font-bold ${highContrast ? 'text-yellow-300' : 'text-[#E94928]'}`}>{error}</p>
      )}

      {rows.length === 0 ? (
        <p className={`text-sm ${muted}`}>No students yet — grades appear once students sign in and start working.</p>
      ) : (
        <div className={`overflow-x-auto rounded-xl border ${highContrast ? 'border-yellow-400' : 'border-[#414042]/12'}`}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className={headRow}>
                <th className="text-left px-3 py-2 font-bold sticky left-0 z-10 bg-inherit">Student</th>
                {columns.map((column) => (
                  <th key={column.key} className="px-3 py-2 font-bold whitespace-nowrap" title={column.label}>
                    {column.short}
                  </th>
                ))}
                <th className="px-3 py-2 font-bold whitespace-nowrap">Chapter avg</th>
                <th className="px-3 py-2 font-bold whitespace-nowrap">Overall</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.userId} className={`border-t ${cellBorder}`}>
                  <td className={`px-3 py-2 font-bold whitespace-nowrap ${highContrast ? 'bg-zinc-900' : 'bg-white'} sticky left-0`}>
                    {row.name}
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-2 text-center">
                      {gradeCell(row, column.key)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-bold">{chapterAverage(row)}%</td>
                  <td className="px-3 py-2 text-center">{gradeCell(row, 'overall')}</td>
                </tr>
              ))}
              <tr className={`border-t-2 ${highContrast ? 'border-yellow-400' : 'border-[#414042]/25'} font-bold`}>
                <td className={`px-3 py-2 sticky left-0 ${highContrast ? 'bg-zinc-900' : 'bg-white'}`}>Class average</td>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 text-center">
                    {classAverage(column.key)}%
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  {rows.length === 0
                    ? 0
                    : Math.round(rows.reduce((sum, row) => sum + chapterAverage(row), 0) / rows.length)}
                  %
                </td>
                <td className="px-3 py-2 text-center">{classAverage('overall')}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
