import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";
import { FloatingPetals, Sprig } from "@/components/album/Ornaments";

export const Route = createFileRoute("/unlock")({
  loader: async () => await isAlbumUnlocked(),
  component: Unlock,
});

function Unlock() {
  const { unlocked } = Route.useLoaderData();
  const router = useRouter();
  const unlock = useServerFn(unlockAlbum);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unlocked) router.navigate({ to: "/album" });
  }, [unlocked, router]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(false);
    const res = await unlock({ data: { passcode: value } });
    if (res.ok) {
      await router.invalidate();
      router.navigate({ to: "/album" });
    } else {
      setLoading(false);
      setError(true);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden">
      <FloatingPetals />

      <Sprig className="hidden md:block absolute left-4 bottom-8 w-28 h-40 text-[color:var(--gold)]/50 rotate-[-14deg]" />
      <Sprig
        flip
        className="hidden md:block absolute right-4 top-10 w-24 h-36 text-[color:var(--gold)]/45 rotate-[12deg]"
      />

      <form
        onSubmit={onSubmit}
        className={`relative w-full max-w-md ${error ? "shake" : ""}`}
        style={{ transform: "rotate(-0.6deg)" }}
      >
        <div
          className="relative px-10 py-14 sm:px-12 sm:py-16 border border-[color:var(--sepia)]/25 shadow-[0_24px_60px_-30px_rgba(80,40,30,0.4),0_2px_6px_rgba(80,40,30,0.08)]"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.965 0.026 84) 0%, oklch(0.955 0.03 82) 100%)",
          }}
        >
          {/* subtle paper grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.24 0 0 0 0 0.14 0 0 0 0.18 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* one soft horizontal fold */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-4 -translate-y-1/2 bg-gradient-to-b from-transparent via-[color:var(--sepia)]/12 to-transparent" />
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-[color:var(--sepia)]/20" />

          {/* faint tea tint at corners */}
          <div className="pointer-events-none absolute -top-4 -right-4 w-40 h-32 rounded-full bg-[color:var(--sepia)]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-6 w-36 h-28 rounded-full bg-[color:var(--sepia)]/8 blur-2xl" />

          <div className="relative z-10">
            {/* eyebrow */}
            <p className="text-center stamp-font text-[0.62rem] tracking-[0.5em] text-[color:var(--sepia)]/80 uppercase">
              Private
            </p>

            {/* headline */}
            <h1 className="mt-6 serif italic text-[2.75rem] sm:text-6xl text-center text-[color:var(--rose-deep)] leading-[0.95]">
              Say the word
            </h1>

            {/* thin divider */}
            <div className="mt-6 flex items-center justify-center gap-3 text-[color:var(--gold)]/70">
              <span className="h-px w-16 bg-current" />
              <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M6 11S1 7.5 1 4.2C1 2.4 2.4 1 4.2 1c.9 0 1.5.4 1.8 1 .3-.6.9-1 1.8-1C9.6 1 11 2.4 11 4.2 11 7.5 6 11 6 11z"
                  fill="currentColor"
                />
              </svg>
              <span className="h-px w-16 bg-current" />
            </div>

            <p className="mt-5 text-center italic text-[15px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
              A quiet word between us opens what's inside.
            </p>

            {/* input */}
            <div className="mt-10">
              <label
                htmlFor="passcode"
                className="block text-center stamp-font text-[0.6rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase mb-3"
              >
                whisper it here
              </label>
              <input
                id="passcode"
                ref={inputRef}
                name="passcode"
                type="password"
                autoComplete="off"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="our word"
                className="w-full bg-transparent text-center font-serif italic text-2xl sm:text-[1.75rem] text-ink px-2 py-3 border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none transition-colors tracking-[0.18em] caret-[color:var(--rose-deep)] placeholder:text-[color:var(--sepia)]/45 placeholder:italic placeholder:tracking-[0.18em]"
              />

              <div className="min-h-[1.5rem] mt-3 text-center">
                {error ? (
                  <p className="text-sm italic text-destructive">
                    Not quite. Try again.
                  </p>
                ) : (
                  <p className="text-xs italic text-muted-foreground/80">
                    the one only you would guess
                  </p>
                )}
              </div>
            </div>

            {/* action */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="group inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[0.72rem] tracking-[0.32em] uppercase font-medium transition-all duration-300 hover:bg-[color:var(--pink-vivid)] hover:shadow-[0_20px_40px_-18px_color-mix(in_oklab,var(--rose-deep)_70%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "opening" : "enter"}</span>
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="transition-transform group-hover:translate-x-1">
                  <path d="M1 5h13m0 0L10 1m4 4l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <p className="stamp-font text-[0.58rem] tracking-[0.4em] text-[color:var(--sepia)]/70 uppercase">
                No. 01 · for two
              </p>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shake { animation: shakeX 380ms ease; }
      `}</style>
    </div>
  );
}
