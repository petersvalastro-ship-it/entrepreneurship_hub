import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import neiaLogo from "../assets/neia-logo.png.asset.json";
import { checkSiteAccess, unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/unlock")({
  beforeLoad: async () => {
    const { unlocked } = await checkSiteAccess();
    if (unlocked) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Enter Access Password · NEIA Entrepreneur Hub" },
      { name: "description", content: "Enter the class access password to open the NEIA Entrepreneur Hub." },
      { property: "og:title", content: "NEIA Entrepreneur Hub · Access" },
      { property: "og:description", content: "A private learning hub for NEIA middle school entrepreneurs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(false);
    try {
      const res = await unlock({ data: { password } });
      if (res.ok) await router.navigate({ to: "/" });
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  const logoSrc = (neiaLogo as { url?: string }).url ?? (neiaLogo as unknown as string);

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 bg-[#414042]">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C51C63]/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-[#E94928]/35 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#EFA835]/25 blur-3xl" />
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="h-2 flex">
          <span className="flex-1 bg-[#C51C63]" />
          <span className="flex-1 bg-[#E94928]" />
          <span className="flex-1 bg-[#EFA835]" />
        </div>
        <div className="p-8">
          <img src={logoSrc} alt="NEIA" className="h-14 w-auto mx-auto" />
          <h1 className="mt-5 text-center text-2xl font-black text-[#414042]">NEIA Entrepreneur Hub</h1>
          <p className="mt-1 text-center text-sm text-[#414042]/70">
            Exclusively for Middle School Entrepreneurship students and faculty.
            Enter the access password to continue.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <label htmlFor="site-pass" className="text-xs font-bold uppercase tracking-wide text-[#414042]/70">
              Access password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#414042]/40" />
              <input
                id="site-pass"
                type={show ? "text" : "password"}
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error}
                className="w-full rounded-xl border border-[#414042]/25 pl-9 pr-10 py-3 text-[#414042] focus:outline-none focus:ring-2 focus:ring-[#C51C63]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#414042]/50"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-sm font-semibold text-[#C51C63]">
                That password isn't right. Check with Pietro and try again.
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C51C63] hover:bg-[#C51C63]/90 text-white font-bold py-3 transition disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enter the Hub
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#414042]/70">
            Need help accessing this site? Email{" "}
            <a
              href="mailto:pietro.valastro@neiacademy.org"
              className="font-semibold text-[#C51C63] underline underline-offset-2 hover:text-[#C51C63]/80"
            >
              pietro.valastro@neiacademy.org
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
