import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";
import { FloatingPetals, Sprig, Flourish, HeartIcon, Butterfly } from "@/components/album/Ornaments";

export const Route = createFileRoute("/")({
  loader: async () => await isAlbumUnlocked(),
  component: Cover,
});

function Cover() {
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
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">
      <FloatingPetals />

      <Sprig className="hidden md:block absolute left-6 top-16 w-24 text-[color:var(--pink-vivid)]/50 rise-1" />
      <Sprig flip className="hidden md:block absolute right-6 bottom-16 w-24 text-[color:var(--pink-vivid)]/50 rise-2" />
      <Butterfly className="hidden md:block absolute right-24 top-24 w-12 text-[color:var(--pink-vivid)]/70 animate-[sway_7s_ease-in-out_infinite]" />
      <Butterfly className="hidden md:block absolute left-32 bottom-32 w-9 text-[color:var(--rose-deep)]/60 animate-[sway_9s_ease-in-out_infinite]" />

      <form
        onSubmit={onSubmit}
        className={`relative z-10 w-full max-w-xl ${error ? "shake" : ""}`}
        style={{ transform: "rotate(-0.4deg)" }}
      >
        <div
          className="relative px-10 py-14 md:px-14 md:py-16 border border-[color:var(--sepia)]/25 rounded-sm shadow-[0_24px_60px_-30px_rgba(80,40,30,0.4),0_2px_6px_rgba(80,40,30,0.08)] text-center"
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
          {/* soft fold */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-4 -translate-y-1/2 bg-gradient-to-b from-transparent via-[color:var(--sepia)]/12 to-transparent" />
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-[color:var(--sepia)]/20" />
          {/* faint tea corners */}
          <div className="pointer-events-none absolute -top-4 -right-4 w-40 h-32 rounded-full bg-[color:var(--sepia)]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-6 w-36 h-28 rounded-full bg-[color:var(--sepia)]/8 blur-2xl" />

          <div className="relative z-10">
            <p className="hand text-3xl text-[color:var(--pink-vivid)]">for you, my love —</p>

            <h1 className="serif text-6xl md:text-7xl mt-3 text-ink italic leading-[1.05]">
              Our
              <span className="mx-3 text-[color:var(--pink-vivid)]">&amp;</span>
              Always
            </h1>

            <Flourish className="mt-6 mb-4" />

            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto italic">
              Every quiet morning, every messy laugh, every somewhere-we-got-lost.
              A little home for the moments I never want to forget — and all the
              ones we haven't lived yet.
            </p>

            <div className="gold-divider my-8 mx-auto w-40" />

            <p className="stamp-font text-[0.6rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase mb-3">
              whisper our word
            </p>
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
              className="w-full max-w-sm mx-auto block bg-transparent text-center font-serif italic text-2xl sm:text-[1.75rem] text-ink px-2 py-3 border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--pink-vivid)] outline-none transition-colors tracking-[0.18em] caret-[color:var(--pink-vivid)] placeholder:text-[color:var(--sepia)]/45 placeholder:italic placeholder:tracking-[0.18em]"
            />
            <div className="min-h-[1.5rem] mt-3">
              {error ? (
                <p className="text-sm italic text-destructive">Not quite. Try again.</p>
              ) : (
                <p className="text-xs italic text-muted-foreground/80">the one only you would guess</p>
              )}
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="btn-love disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HeartIcon className="w-4 h-4" />
                {loading ? "opening" : "Open the album"}
              </button>
              <p className="hand text-xl text-[color:var(--pink-vivid)]/90">
                — always, always yours
              </p>
            </div>

            <p className="stamp-font text-[10px] uppercase tracking-[0.35em] text-[color:var(--sepia)]/80 mt-8">
              a keepsake · hand-made · no. 001
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
      `}</style>
    </div>
  );
}
