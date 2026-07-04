import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";
import {
  FloatingPetals,
  HeartIcon,
  Sprig,
  Flourish,
  Butterfly,
} from "@/components/album/Ornaments";

export const Route = createFileRoute("/")({
  loader: async () => await isAlbumUnlocked(),
  component: Cover,
});

function Cover() {
  const { unlocked } = Route.useLoaderData();
  const router = useRouter();
  const unlock = useServerFn(unlockAlbum);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unlocked) router.navigate({ to: "/album" });
  }, [unlocked, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await unlock({ data: {} });
    if (res.ok) {
      await router.invalidate();
      router.navigate({ to: "/album" });
    } else {
      setLoading(false);
    }
  }


  return (
    <div className="relative h-screen flex items-center justify-center px-6 py-6 overflow-hidden">
      <FloatingPetals />

      <Sprig className="hidden md:block absolute left-4 top-6 w-20 text-[color:var(--pink-vivid)]/50 rise-1" />
      <Sprig
        flip
        className="hidden md:block absolute right-4 bottom-6 w-20 text-[color:var(--pink-vivid)]/50 rise-2"
      />
      <Butterfly className="hidden md:block absolute right-16 top-10 w-10 text-[color:var(--pink-vivid)]/70 animate-[sway_7s_ease-in-out_infinite]" />
      <Butterfly className="hidden md:block absolute left-20 bottom-16 w-8 text-[color:var(--rose-deep)]/60 animate-[sway_9s_ease-in-out_infinite]" />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-xl rise-1"
        style={{ transform: "rotate(-0.6deg)" }}
      >

        {/* vintage letter paper */}
        <div className="relative bg-[color:var(--letter-paper)] border border-[color:var(--sepia)]/25 px-8 sm:px-12 pt-10 pb-10 shadow-[0_28px_70px_-30px_rgba(80,40,30,0.5),0_2px_6px_rgba(80,40,30,0.12)] letter-paper">

          {/* aged grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/><feColorMatrix values='0 0 0 0 0.32 0 0 0 0 0.22 0 0 0 0 0.14 0 0 0 0.14 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
          />


          {/* tea stains */}
          <div className="pointer-events-none absolute top-10 right-14 w-28 h-28 rounded-full bg-[color:var(--sepia)]/12 blur-2xl" />
          <div className="pointer-events-none absolute bottom-16 left-10 w-20 h-20 rounded-full bg-[color:var(--sepia)]/10 blur-xl" />

          {/* deckled edges */}
          <div className="pointer-events-none absolute inset-0 deckled" />

          {/* faint ruled lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, var(--sepia) 31px, var(--sepia) 32px)",
              backgroundPosition: "0 88px",
            }}
          />

          <div className="relative z-10 text-center">
            <p className="stamp-font text-[0.6rem] tracking-[0.5em] text-[color:var(--sepia)] uppercase">
              a keepsake · for you
            </p>

            <p className="hand text-3xl text-[color:var(--pink-vivid)] mt-3">for you, my love —</p>

            <h1 className="serif text-5xl sm:text-7xl mt-1 text-ink italic leading-[1.05]">
              Our
              <span className="mx-3 text-[color:var(--pink-vivid)]">&amp;</span>
              Always
            </h1>

            <Flourish className="mt-4 mb-3" />

            <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto italic">
              Every quiet morning, every messy laugh, every somewhere-we-got-lost — a little home for the moments I never want to forget.
            </p>

            {/* input */}
            <div className="mt-6 max-w-sm mx-auto">
              <label
                htmlFor="passcode"
                className="block stamp-font text-[0.58rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase mb-2"
              >
                whisper the word
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
                className="relative z-10 w-full bg-transparent text-center font-serif italic text-2xl sm:text-[1.6rem] text-ink px-2 py-3 border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none transition-colors tracking-[0.18em] caret-[color:var(--rose-deep)] placeholder:text-[color:var(--sepia)]/45 placeholder:italic placeholder:tracking-[0.18em]"
              />

              <div className="min-h-[1.5rem] mt-2 relative z-10">
                {error ? (
                  <p className="text-xs italic text-destructive">Not quite. Try again.</p>
                ) : (
                  <p className="text-[11px] italic text-muted-foreground/80">
                    the one only you would guess
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="mt-5 group inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[0.72rem] tracking-[0.32em] uppercase font-medium transition-all duration-300 hover:bg-[color:var(--pink-vivid)] hover:shadow-[0_20px_40px_-18px_color-mix(in_oklab,var(--rose-deep)_70%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HeartIcon className="w-3.5 h-3.5" />
                <span>{loading ? "opening" : "open the album"}</span>
              </button>
            </div>

            <div className="gold-divider mt-6 mb-3 mx-auto w-40" />
            <p className="stamp-font text-[9px] uppercase tracking-[0.35em] text-[color:var(--sepia)]/80">
              hand-made · no. 001
            </p>
          </div>

        </div>
      </form>

      <style>{`
        @keyframes shakeX {
          0%,100% { transform: translateX(0) rotate(-0.6deg); }
          20% { transform: translateX(-6px) rotate(-0.6deg); }
          40% { transform: translateX(6px) rotate(-0.6deg); }
          60% { transform: translateX(-4px) rotate(-0.6deg); }
          80% { transform: translateX(4px) rotate(-0.6deg); }
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
