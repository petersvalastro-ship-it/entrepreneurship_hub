import { useState } from 'react';
import { LogIn, UserPlus, X, Loader2, ShieldCheck } from 'lucide-react';

type Credentials = {
  firstName: string;
  lastInitial: string;
  grade: string;
  password: string;
  suffix?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  highContrast: boolean;
  onGoogle: () => void | Promise<unknown>;
  onCreate: (input: Credentials) => Promise<{ error?: string }>;
  onSignIn: (input: Credentials) => Promise<{ error?: string }>;
};

const GRADES = ['7', '8'];

/**
 * Lets students either sign in with their school Google account or make a
 * simple Student Account from first name, last initial, grade and a password.
 */
export function StudentAccountModal({ open, onClose, highContrast, onGoogle, onCreate, onSignIn }: Props) {
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [firstName, setFirstName] = useState('');
  const [lastInitial, setLastInitial] = useState('');
  const [grade, setGrade] = useState('7');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [suffix, setSuffix] = useState('');
  const [needsSuffix, setNeedsSuffix] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const panel = highContrast
    ? 'bg-zinc-900 border-2 border-yellow-400 text-white'
    : 'bg-white border border-[#414042]/15 text-[#414042]';
  const field = highContrast
    ? 'bg-zinc-950 border-2 border-yellow-400 text-yellow-100 placeholder-yellow-200/50'
    : 'bg-white border border-[#414042]/25 text-[#414042] placeholder-[#414042]/40';
  const label = `text-xs font-bold uppercase tracking-wide ${highContrast ? 'text-yellow-300' : 'text-[#414042]/70'}`;

  async function submit() {
    setError(null);
    const first = firstName.trim();
    const initial = lastInitial.trim();
    if (first.length < 2 || !/^[a-zA-Z]+$/.test(first)) {
      setError('Please type your first name using letters only.');
      return;
    }
    if (!/^[a-zA-Z]$/.test(initial)) {
      setError('Last initial should be a single letter (for example R).');
      return;
    }
    if (password.length < 6) {
      setError('Your password needs at least 6 characters.');
      return;
    }
    if (mode === 'create' && password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    const payload: Credentials = { firstName: first, lastInitial: initial, grade, password, suffix };
    const result = mode === 'create' ? await onCreate(payload) : await onSignIn(payload);
    setBusy(false);
    if (result.error === 'taken') {
      setNeedsSuffix(true);
      setError(
        `Someone in grade ${grade} already uses ${first} ${initial.toUpperCase()}. Add a number below (like 2) to make yours unique.`,
      );
      return;
    }
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="student-account-title">
      <div className={`absolute inset-0 ${highContrast ? 'bg-black/85' : 'bg-black/55'}`} onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${panel}`}>
        <button
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-3 right-3 p-1.5 rounded-full transition ${highContrast ? 'hover:bg-zinc-800 text-yellow-300' : 'hover:bg-[#414042]/10'}`}
        >
          <X className="w-4 h-4" />
        </button>

        <h2 id="student-account-title" className="text-xl font-black">Save your progress</h2>
        <p className={`mt-1 text-sm ${highContrast ? 'text-yellow-200' : 'text-[#414042]/75'}`}>
          Your XP, notes, glossary terms and learning goals follow you to any device.
        </p>

        <button
          onClick={() => void onGoogle()}
          className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border transition ${
            highContrast ? 'border-yellow-400 text-yellow-300 hover:bg-zinc-800' : 'border-[#414042]/20 text-[#414042] hover:bg-[#414042]/5'
          }`}
        >
          <LogIn className="w-4 h-4" /> Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <span className={`h-px flex-1 ${highContrast ? 'bg-yellow-400/40' : 'bg-[#414042]/15'}`} />
          <span className={`text-xs font-bold ${highContrast ? 'text-yellow-300' : 'text-[#414042]/50'}`}>OR STUDENT ACCOUNT</span>
          <span className={`h-px flex-1 ${highContrast ? 'bg-yellow-400/40' : 'bg-[#414042]/15'}`} />
        </div>

        <div className={`flex rounded-lg p-1 ${highContrast ? 'bg-zinc-950 border border-yellow-400/50' : 'bg-[#414042]/8'}`}>
          {(['create', 'signin'] as const).map((value) => (
            <button
              key={value}
              onClick={() => { setMode(value); setError(null); }}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                mode === value
                  ? highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white'
                  : highContrast ? 'text-yellow-300' : 'text-[#414042]/70'
              }`}
            >
              {value === 'create' ? 'Create account' : 'Sign back in'}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="sa-first">First name</label>
              <input
                id="sa-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Maya"
                className={`mt-1 w-full rounded-lg px-3 py-2 text-sm ${field}`}
              />
            </div>
            <div>
              <label className={label} htmlFor="sa-initial">Last initial</label>
              <input
                id="sa-initial"
                value={lastInitial}
                maxLength={1}
                onChange={(e) => setLastInitial(e.target.value)}
                placeholder="R"
                className={`mt-1 w-full rounded-lg px-3 py-2 text-sm ${field}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="sa-grade">Grade</label>
              <select
                id="sa-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`mt-1 w-full rounded-lg px-3 py-2 text-sm ${field}`}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
            {(needsSuffix || suffix) && (
              <div>
                <label className={label} htmlFor="sa-suffix">Number (if asked)</label>
                <input
                  id="sa-suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="2"
                  className={`mt-1 w-full rounded-lg px-3 py-2 text-sm ${field}`}
                />
              </div>
            )}
          </div>

          <div>
            <label className={label} htmlFor="sa-pass">Password</label>
            <input
              id="sa-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={`mt-1 w-full rounded-lg px-3 py-2 text-sm ${field}`}
            />
          </div>

          {mode === 'create' && (
            <div>
              <label className={label} htmlFor="sa-confirm">Repeat password</label>
              <input
                id="sa-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`mt-1 w-full rounded-lg px-3 py-2 text-sm ${field}`}
              />
            </div>
          )}

          {error && (
            <p className={`text-sm font-semibold ${highContrast ? 'text-yellow-300' : 'text-[#C51C63]'}`}>{error}</p>
          )}

          <button
            onClick={() => void submit()}
            disabled={busy}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-60 ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-[#C51C63] text-white hover:bg-[#C51C63]/90'
            }`}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'create' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {mode === 'create' ? 'Create my Student Account' : 'Sign back in'}
          </button>

          <p className={`flex items-start gap-2 text-xs ${highContrast ? 'text-yellow-200' : 'text-[#414042]/60'}`}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            No email needed. Write your password somewhere safe — Pietro can reset it if you forget.
          </p>
        </div>
      </div>
    </div>
  );
}
