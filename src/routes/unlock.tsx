import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";
import { FloatingPetals } from "@/components/album/Ornaments";

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
    <div className="relative min-h-screen flex items-center justify-center px-5 py-14 overflow-hidden">
      <FloatingPetals />

      <div
        className={`relative w-full max-w-5xl grid md:grid-cols-[1.05fr_1fr] rounded-[14px] overflow-hidden bg-[color:var(--card)]/85 backdrop-blur-sm border border-[color:var(--sepia)]/25 shadow-[0_40px_80px_-40px_rgba(60,20,30,0.4)] rise-1 ${error ? "shake" : ""}`}
      >
        {/* LEFT — botanical panel */}
        <aside className="relative hidden md:block min-h-[560px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 20% 10%, color-mix(in oklab, var(--blush) 85%, transparent), transparent 60%), radial-gradient(120% 90% at 90% 100%, color-mix(in oklab, var(--pink-vivid) 22%, transparent), transparent 60%), linear-gradient(160deg, #f5d9d9, #e9c2c8 60%, #d99aa9)",
            }}
          />
          {/* soft grain */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* botanical illustration */}
          <svg
            viewBox="0 0 400 600"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <radialGradient id="rose" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbe4ea" />
                <stop offset="55%" stopColor="#d97a90" />
                <stop offset="100%" stopColor="#8a2a45" />
              </radialGradient>
              <radialGradient id="rose2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f7d0d7" />
                <stop offset="60%" stopColor="#c86578" />
                <stop offset="100%" stopColor="#6a1c34" />
              </radialGradient>
              <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a3b18a" />
                <stop offset="100%" stopColor="#4a5d3a" />
              </linearGradient>
            </defs>

            {/* stems */}
            <g stroke="#5d6b48" strokeWidth="1.6" fill="none" opacity="0.85">
              <path d="M60 600 C 80 480, 60 380, 110 260" />
              <path d="M340 600 C 320 500, 360 400, 300 300" />
              <path d="M200 600 C 210 500, 190 420, 210 340" />
            </g>

            {/* leaves */}
            <g fill="url(#leaf)" opacity="0.9">
              <ellipse cx="70" cy="470" rx="26" ry="10" transform="rotate(-30 70 470)" />
              <ellipse cx="90" cy="380" rx="22" ry="9" transform="rotate(-20 90 380)" />
              <ellipse cx="330" cy="470" rx="26" ry="10" transform="rotate(28 330 470)" />
              <ellipse cx="215" cy="480" rx="20" ry="8" transform="rotate(-10 215 480)" />
              <ellipse cx="200" cy="410" rx="24" ry="9" transform="rotate(15 200 410)" />
            </g>

            {/* rose blossoms */}
            <g>
              <circle cx="110" cy="230" r="58" fill="url(#rose)" opacity="0.95" />
              <circle cx="110" cy="230" r="34" fill="#a83a55" opacity="0.55" />
              <circle cx="110" cy="230" r="16" fill="#5f1a2c" opacity="0.7" />

              <circle cx="300" cy="270" r="46" fill="url(#rose2)" opacity="0.9" />
              <circle cx="300" cy="270" r="26" fill="#8a2a45" opacity="0.55" />

              <circle cx="215" cy="320" r="34" fill="url(#rose)" opacity="0.85" />
              <circle cx="215" cy="320" r="18" fill="#7a2540" opacity="0.55" />
            </g>

            {/* small buds */}
            <g fill="#c86578" opacity="0.85">
              <circle cx="55" cy="330" r="8" />
              <circle cx="345" cy="360" r="7" />
              <circle cx="180" cy="240" r="6" />
              <circle cx="255" cy="190" r="6" />
            </g>

            {/* petals falling */}
            <g fill="#e8a3ae" opacity="0.75">
              <ellipse cx="60" cy="120" rx="7" ry="12" transform="rotate(20 60 120)" />
              <ellipse cx="340" cy="150" rx="6" ry="10" transform="rotate(-15 340 150)" />
              <ellipse cx="150" cy="80" rx="5" ry="9" transform="rotate(35 150 80)" />
              <ellipse cx="280" cy="90" rx="6" ry="10" transform="rotate(-25 280 90)" />
            </g>
          </svg>

          {/* editorial label */}
          <div className="absolute inset-0 flex flex-col justify-between p-8 text-[color:var(--card)]">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-current opacity-70" />
              <span className="stamp-font text-[0.62rem] tracking-[0.45em] uppercase opacity-90">
                Chapter 00
              </span>
            </div>
            <div>
              <p className="serif italic text-3xl leading-tight drop-shadow-sm">
                Every love story<br />begins with a word.
              </p>
              <p className="mt-3 stamp-font text-[0.6rem] tracking-[0.4em] uppercase opacity-80">
                — for you, only —
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT — form */}
        <section className="relative px-8 py-14 sm:px-14 sm:py-16 flex flex-col justify-center">
          {/* corner marks */}
          <CornerMark className="absolute top-4 left-4" />
          <CornerMark className="absolute top-4 right-4 rotate-90" />
          <CornerMark className="absolute bottom-4 left-4 -rotate-90" />
          <CornerMark className="absolute bottom-4 right-4 rotate-180" />

          <form onSubmit={onSubmit} className="relative">
            <div className="flex items-center justify-center gap-3 text-[color:var(--gold)]">
              <span className="h-px w-8 bg-current opacity-70" />
              <span className="stamp-font text-[0.62rem] tracking-[0.42em] uppercase text-[color:var(--sepia)]">
                Private
              </span>
              <span className="h-px w-8 bg-current opacity-70" />
            </div>

            <h1 className="mt-6 serif italic text-center text-[color:var(--rose-deep)] leading-[0.95] text-[3.25rem] sm:text-[3.75rem]">
              Say the word
            </h1>

            <div className="mt-5 flex items-center justify-center gap-3 text-[color:var(--gold)]/80">
              <svg width="60" height="8" viewBox="0 0 60 8" fill="none" aria-hidden>
                <path d="M0 4h24" stroke="currentColor" strokeWidth="1" />
                <path d="M36 4h24" stroke="currentColor" strokeWidth="1" />
              </svg>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M6 11S1 7.5 1 4.2C1 2.4 2.4 1 4.2 1c.9 0 1.5.4 1.8 1 .3-.6.9-1 1.8-1C9.6 1 11 2.4 11 4.2 11 7.5 6 11 6 11z"
                  fill="currentColor"
                />
              </svg>
              <svg width="60" height="8" viewBox="0 0 60 8" fill="none" aria-hidden>
                <path d="M0 4h24" stroke="currentColor" strokeWidth="1" />
                <path d="M36 4h24" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>

            <p className="mt-5 text-center italic text-[15px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
              A quiet word between us opens what's inside.
            </p>

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
                className="w-full bg-transparent text-center font-serif italic text-3xl text-ink px-2 py-3 border-b border-[color:var(--sepia)]/40 focus:border-[color:var(--rose-deep)] outline-none transition-colors tracking-[0.2em] caret-[color:var(--rose-deep)] placeholder:text-[color:var(--sepia)]/40 placeholder:italic"
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

            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="group inline-flex items-center gap-3 px-9 py-3 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[0.72rem] tracking-[0.34em] uppercase font-medium transition-all duration-300 hover:bg-[color:var(--pink-vivid)] hover:shadow-[0_22px_45px_-18px_color-mix(in_oklab,var(--rose-deep)_70%,transparent)] disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <span>{loading ? "opening" : "enter"}</span>
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="transition-transform group-hover:translate-x-1">
                  <path d="M1 5h15m0 0L12 1m4 4l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <p className="stamp-font text-[0.58rem] tracking-[0.4em] text-[color:var(--sepia)]/70 uppercase">
                No. 01 · for two
              </p>
            </div>
          </form>
        </section>
      </div>

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

function CornerMark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className={`text-[color:var(--gold)]/60 ${className}`}
      fill="none"
      aria-hidden
    >
      <path d="M1 8V1h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="1" cy="1" r="0.8" fill="currentColor" />
    </svg>
  );
}
