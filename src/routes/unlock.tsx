import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";
import { FloatingPetals, HeartIcon, Sprig } from "@/components/album/Ornaments";

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
  const [sealBroken, setSealBroken] = useState(false);

  useEffect(() => {
    if (unlocked) router.navigate({ to: "/album" });
  }, [unlocked, router]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(false);
    setSealBroken(true);
    const res = await unlock({ data: { passcode: value } });
    if (res.ok) {
      await new Promise((r) => setTimeout(r, 550));
      await router.invalidate();
      router.navigate({ to: "/album" });
    } else {
      setLoading(false);
      setError(true);
      setSealBroken(false);
      // little shake reset
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden">
      <FloatingPetals />

      {/* botanical accents */}
      <Sprig className="hidden md:block absolute left-6 bottom-6 w-32 h-44 text-[color:var(--gold)]/70 rotate-[-12deg]" />
      <Sprig
        flip
        className="hidden md:block absolute right-6 top-8 w-28 h-40 text-[color:var(--gold)]/60 rotate-[10deg]"
      />

      <form
        onSubmit={onSubmit}
        className={`envelope relative w-full max-w-lg rise-1 ${error ? "shake" : ""}`}
      >
        {/* Envelope back / body */}
        <div className="envelope-body aged-paper relative rounded-[10px] px-8 pt-24 pb-10 sm:px-12 sm:pt-28 sm:pb-12">
          {/* Envelope top flap */}
          <div
            className={`envelope-flap ${sealBroken ? "flap-open" : ""}`}
            aria-hidden
          />

          {/* Wax seal on flap */}
          <button
            type="button"
            aria-label="focus"
            onClick={() => inputRef.current?.focus()}
            className={`wax-seal absolute left-1/2 -translate-x-1/2 -top-8 z-20 transition-transform duration-500 ${
              sealBroken ? "seal-broken" : "hover:scale-[1.04]"
            }`}
          >
            <HeartIcon className="w-8 h-8 animate-[heartbeat_2.4s_ease-in-out_infinite]" />
          </button>

          {/* Postmark */}
          <div className="absolute top-6 right-6 postmark">Private · No. 1</div>

          {/* Addressed to */}
          <div className="text-center">
            <p className="stamp-font text-[0.68rem] tracking-[0.32em] text-[color:var(--sepia)] uppercase">
              To — my dearest
            </p>
            <h1 className="serif italic text-5xl sm:text-6xl text-[color:var(--rose-deep)] mt-2 leading-none">
              Say the word
            </h1>
            <p className="hand text-2xl text-ink/70 mt-3">
              &mdash; a little secret between us &mdash;
            </p>
          </div>

          {/* Passcode field */}
          <div className="mt-10 relative">
            <label
              htmlFor="passcode"
              className="block text-center stamp-font text-[0.65rem] tracking-[0.32em] text-[color:var(--sepia)] uppercase mb-3"
            >
              whisper it here
            </label>

            <div className="relative mx-auto max-w-sm">
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
                placeholder=" "
                className="peer w-full bg-transparent text-center font-serif italic text-3xl sm:text-4xl text-ink px-3 py-3 border-b-[2px] border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none transition-colors tracking-[0.35em] caret-[color:var(--rose-deep)]"
              />
              {/* placeholder dots when empty */}
              {value.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 text-[color:var(--sepia)]/55">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-current opacity-70"
                    />
                  ))}
                </div>
              )}
              {/* underline decorative hearts */}
              <div className="absolute -bottom-3 left-0 right-0 flex items-center justify-center gap-2 text-[color:var(--pink-vivid)]/50">
                <span className="h-px flex-1 bg-[color:var(--gold)]/40" />
                <HeartIcon className="w-3 h-3" />
                <span className="h-px flex-1 bg-[color:var(--gold)]/40" />
              </div>
            </div>

            <div className="min-h-[1.75rem] mt-4 text-center">
              {error ? (
                <p className="hand text-lg text-destructive">
                  hmm, not quite — try again, my love ✿
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  the word only you and I know
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="btn-love disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <HeartIcon className="w-4 h-4" />
              {loading ? "opening the letter…" : "break the seal"}
            </button>
            <p className="stamp-font text-[0.6rem] tracking-[0.3em] text-[color:var(--sepia)]/80 uppercase">
              sealed with love · est. us
            </p>
          </div>
        </div>
      </form>

      <style>{`
        .envelope-body {
          background-image:
            repeating-linear-gradient(180deg, transparent 0 32px, color-mix(in oklab, var(--sepia) 10%, transparent) 32px 33px),
            radial-gradient(120px 90px at 10% 20%, color-mix(in oklab, var(--sepia) 22%, transparent), transparent 70%),
            radial-gradient(90px 70px at 90% 85%, color-mix(in oklab, var(--sepia) 20%, transparent), transparent 70%),
            linear-gradient(155deg, #fbf4e6, #f2e3c8 60%, #f7ecd6);
          border: 1px solid color-mix(in oklab, var(--sepia) 35%, transparent);
        }
        .envelope-flap {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 96px;
          background: linear-gradient(180deg,
            color-mix(in oklab, var(--blush) 55%, #fbf4e6) 0%,
            color-mix(in oklab, var(--blush) 20%, #f6e6ce) 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          box-shadow: inset 0 -6px 12px -8px color-mix(in oklab, var(--sepia) 45%, transparent);
          transform-origin: top center;
          transition: transform 700ms cubic-bezier(.5,1.6,.4,1), opacity 600ms ease;
          z-index: 10;
        }
        .envelope-flap::after {
          content: "";
          position: absolute; inset: 0;
          background:
            repeating-linear-gradient(135deg,
              transparent 0 10px,
              color-mix(in oklab, var(--rose-deep) 18%, transparent) 10px 12px);
          opacity: 0.25;
          clip-path: inherit;
        }
        .flap-open { transform: rotateX(180deg) translateY(-8px); opacity: 0.85; }
        .seal-broken { transform: translate(-50%, -20px) rotate(-14deg) scale(0.94); opacity: 0.9; }

        .envelope { perspective: 1200px; }
        .envelope-body { transform-style: preserve-3d; }

        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .shake { animation: shakeX 420ms ease; }
      `}</style>
    </div>
  );
}
