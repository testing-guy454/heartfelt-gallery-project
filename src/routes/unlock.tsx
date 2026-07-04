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

  useEffect(() {
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
        className={`relative w-full max-w-md rise-1 ${error ? "shake" : ""}`}
        style={{ transform: "rotate(-0.8deg)" }}
      >
        {/* vintage letter paper */}
        <div className="relative bg-[color:var(--letter-paper)] border border-[color:var(--sepia)]/25 px-9 py-12 sm:px-12 sm:py-14 shadow-[0_24px_60px_-30px_rgba(80,40,30,0.45),0_2px_6px_rgba(80,40,30,0.12)] letter-paper">
          {/* aged grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/><feColorMatrix values='0 0 0 0 0.32 0 0 0 0 0.22 0 0 0 0 0.14 0 0 0 0.14 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* fold creases */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[color:var(--sepia)]/25 to-transparent" />
          <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-[color:var(--sepia)]/15 to-transparent" />

          {/* tea stain spots */}
          <div className="pointer-events-none absolute top-8 right-10 w-24 h-24 rounded-full bg-[color:var(--sepia)]/10 blur-2xl" />
          <div className="pointer-events-none absolute bottom-16 left-8 w-16 h-16 rounded-full bg-[color:var(--rose-deep)]/8 blur-xl" />

          {/* deckled edge mask */}
          <div className="pointer-events-none absolute inset-0 deckled" />

          {/* faint letter lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, var(--sepia) 31px, var(--sepia) 32px)",
              backgroundPosition: "0 88px",
            }}
          />

          {/* thin inner frame with corner leaves */}
          <div className="pointer-events-none absolute inset-3 border border-[color:var(--gold)]/35">
            <CornerLeaf className="absolute -top-1.5 -left-1.5" />
            <CornerLeaf className="absolute -top-1.5 -right-1.5 rotate-90" />
            <CornerLeaf className="absolute -bottom-1.5 -left-1.5 -rotate-90" />
            <CornerLeaf className="absolute -bottom-1.5 -right-1.5 rotate-180" />
          </div>

          {/* small postmark */}
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 flex items-center justify-center w-16 h-16 border border-[color:var(--sepia)]/30 rounded-full rotate-12 opacity-75">
            <div className="flex flex-col items-center text-[color:var(--sepia)]/80">
              <span className="stamp-font text-[0.48rem] tracking-[0.2em] uppercase">love</span>
              <svg width="14" height="14" viewBox="0 0 14 14" className="my-0.5">
                <path d="M7 12S2.5 9 2.5 5.5C2.5 3.5 4 2.5 5.5 2.5c.8 0 1.4.4 1.5.8.3-.4.8-.8 1.5-.8C10 2.5 11.5 3.5 11.5 5.5 11.5 9 7 12 7 12z" fill="currentColor" />
              </svg>
              <span className="stamp-font text-[0.4rem] tracking-[0.15em] uppercase">No. 01</span>
            </div>
          </div>

          {/* eyebrow */}
          <p className="text-center stamp-font text-[0.62rem] tracking-[0.45em] text-[color:var(--sepia)] uppercase">
            Private
          </p>

          {/* headline */}
          <h1 className="mt-6 serif italic text-[2.75rem] sm:text-6xl text-center text-[color:var(--rose-deep)] leading-[0.95]">
            Say the word
          </h1>

          {/* ornament divider */}
          <div className="mt-6 flex items-center justify-center gap-3 text-[color:var(--gold)]/70">
            <span className="h-px w-14 bg-current" />
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M6 11S1 7.5 1 4.2C1 2.4 2.4 1 4.2 1c.9 0 1.5.4 1.8 1 .3-.6.9-1 1.8-1C9.6 1 11 2.4 11 4.2 11 7.5 6 11 6 11z"
                fill="currentColor"
              />
            </svg>
            <span className="h-px w-14 bg-current" />
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
              className="relative z-10 w-full bg-transparent text-center font-serif italic text-2xl sm:text-[1.75rem] text-ink px-2 py-3 border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none transition-colors tracking-[0.18em] caret-[color:var(--rose-deep)] placeholder:text-[color:var(--sepia)]/45 placeholder:italic placeholder:tracking-[0.18em]"
            />

            <div className="min-h-[1.5rem] mt-3 text-center relative z-10">
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
        .letter-paper {
          clip-path: polygon(
            0% 1%, 2% 0%, 5% 1%, 8% 0%, 12% 1%, 16% 0%, 20% 1%, 24% 0%, 28% 1%, 32% 0%, 36% 1%, 40% 0%, 44% 1%, 48% 0%, 52% 1%, 56% 0%, 60% 1%, 64% 0%, 68% 1%, 72% 0%, 76% 1%, 80% 0%, 84% 1%, 88% 0%, 92% 1%, 96% 0%, 100% 1%,
            100% 98%, 98% 100%, 95% 99%, 92% 100%, 88% 99%, 84% 100%, 80% 99%, 76% 100%, 72% 99%, 68% 100%, 64% 99%, 60% 100%, 56% 99%, 52% 100%, 48% 99%, 44% 100%, 40% 99%, 36% 100%, 32% 99%, 28% 100%, 24% 99%, 20% 100%, 16% 99%, 12% 100%, 8% 99%, 4% 100%, 0% 99%
          );
        }
      `}</style>
    </div>
  );
}

function CornerLeaf({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={`text-[color:var(--gold)]/70 ${className}`}
      fill="none"
      aria-hidden
    >
      <path
        d="M2 14C6 10 10 6 18 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8 18C10 12 14 8 18 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <ellipse
        cx="10"
        cy="10"
        rx="3"
        ry="1.5"
        transform="rotate(45 10 10)"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
