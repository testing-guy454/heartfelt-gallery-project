import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";

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
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #4a3628 0%, #2a1c14 55%, #180f0a 100%)",
      }}
    >
      {/* wood grain / desk texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='w'><feTurbulence type='turbulence' baseFrequency='0.012 0.7' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0.28 0 0 0 0 0.18 0 0 0 0 0.1 0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23w)'/></svg>\")",
        }}
      />
      {/* soft vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* out-of-frame blurred silhouette like the reference */}
      <div
        className="pointer-events-none absolute -left-24 top-1/3 w-72 h-96 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #1a0f08, transparent 70%)" }}
      />

      <form
        onSubmit={onSubmit}
        className={`relative w-full max-w-lg ${error ? "shake" : ""}`}
        style={{ perspective: "1400px" }}
      >
        {/* drop shadow beneath the letter */}
        <div
          aria-hidden
          className="absolute inset-0 translate-y-6 blur-3xl opacity-70"
          style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.75), transparent 65%)" }}
        />

        <div
          className="relative aged-letter"
          style={{ transform: "rotate(-1.2deg)" }}
        >
          {/* base paper */}
          <div
            className="relative px-9 py-14 sm:px-14 sm:py-16"
            style={{
              background:
                "radial-gradient(ellipse at 20% 15%, #f2e2b8 0%, #e8d3a0 35%, #d9bd82 70%, #b89460 100%)",
            }}
          >
            {/* burn / darkened edges */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 45%, rgba(90,50,20,0.55) 100%)",
                mixBlendMode: "multiply",
              }}
            />

            {/* fibrous paper grain */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70 mix-blend-multiply"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.38 0 0 0 0 0.25 0 0 0 0 0.12 0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
              }}
            />

            {/* horizontal fold shadows */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-[33%] h-6"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(80,45,20,0.28), transparent)",
              }}
            />
            <div
              className="pointer-events-none absolute left-0 right-0 top-[66%] h-6"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(80,45,20,0.22), transparent)",
              }}
            />
            {/* vertical center fold */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(60,35,15,0.18), transparent)",
              }}
            />

            {/* fold crease highlights (sharp lines) */}
            <div className="pointer-events-none absolute left-0 right-0 top-[33%] h-px bg-[rgba(255,240,200,0.35)]" />
            <div className="pointer-events-none absolute left-0 right-0 top-[66%] h-px bg-[rgba(255,240,200,0.28)]" />

            {/* tea stains */}
            <div
              className="pointer-events-none absolute top-6 right-14 w-28 h-24 rounded-full opacity-60 blur-xl"
              style={{ background: "radial-gradient(circle, #7a4a1e, transparent 65%)" }}
            />
            <div
              className="pointer-events-none absolute bottom-10 left-6 w-24 h-24 rounded-full opacity-50 blur-xl"
              style={{ background: "radial-gradient(circle, #6b3d18, transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute top-1/2 left-1/3 w-16 h-12 rounded-full opacity-40 blur-lg"
              style={{ background: "radial-gradient(circle, #8a5622, transparent 70%)" }}
            />

            {/* content — handwritten letter */}
            <div className="relative z-10" style={{ color: "#2b1608" }}>
              <p
                className="text-right text-[13px] italic opacity-70"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                somewhere, sometime ·
              </p>

              <p
                className="mt-6 text-[26px] sm:text-[28px] leading-tight"
                style={{ fontFamily: "var(--font-hand)", transform: "rotate(-0.4deg)" }}
              >
                my dearest,
              </p>

              <p
                className="mt-4 text-[19px] sm:text-[21px] leading-[1.55] opacity-90"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                what waits behind these pages is only ours.
                <br />
                whisper the word we share, and it will open —
                <br />
                as it always has, as it always will.
              </p>

              {/* input as if writing on the letter */}
              <div className="mt-10">
                <label
                  htmlFor="passcode"
                  className="block text-[15px] italic opacity-70 mb-1"
                  style={{ fontFamily: "var(--font-hand)" }}
                >
                  our word —
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
                  placeholder="……………………"
                  className="w-full bg-transparent text-[28px] sm:text-[32px] outline-none py-1 tracking-wider"
                  style={{
                    fontFamily: "var(--font-hand)",
                    color: "#2b1608",
                    borderBottom: "1px dashed rgba(60,30,10,0.5)",
                    caretColor: "#2b1608",
                  }}
                />

                <div className="min-h-[1.5rem] mt-2">
                  {error ? (
                    <p
                      className="text-[16px] italic"
                      style={{ fontFamily: "var(--font-hand)", color: "#8a2a1a" }}
                    >
                      not the word. try once more, love.
                    </p>
                  ) : (
                    <p
                      className="text-[15px] italic opacity-60"
                      style={{ fontFamily: "var(--font-hand)" }}
                    >
                      the one only you would guess.
                    </p>
                  )}
                </div>
              </div>

              {/* signature + wax "button" */}
              <div className="mt-10 flex items-end justify-between gap-6">
                <div>
                  <p
                    className="text-[22px] leading-none"
                    style={{
                      fontFamily: "var(--font-hand)",
                      transform: "rotate(-3deg)",
                      display: "inline-block",
                    }}
                  >
                    yours,
                  </p>
                  <p
                    className="mt-1 text-[30px] leading-none"
                    style={{
                      fontFamily: "var(--font-hand)",
                      transform: "rotate(-2deg)",
                      display: "inline-block",
                    }}
                  >
                    always ♡
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !value.trim()}
                  aria-label={loading ? "opening" : "open the letter"}
                  className="group relative shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-rotate-6"
                  style={{ transform: "rotate(-8deg)" }}
                >
                  {/* wax seal */}
                  <span
                    className="flex items-center justify-center w-20 h-20 rounded-full text-[color:var(--primary-foreground)] shadow-[0_6px_14px_-4px_rgba(0,0,0,0.55),inset_0_-6px_10px_rgba(0,0,0,0.35),inset_0_4px_8px_rgba(255,255,255,0.18)]"
                    style={{
                      background:
                        "radial-gradient(circle at 35% 30%, #b83a4a 0%, #8a1a2a 55%, #5a0e1c 100%)",
                    }}
                  >
                    <span
                      className="text-[13px] uppercase tracking-[0.2em] leading-none text-center"
                      style={{ fontFamily: "var(--font-stamp)" }}
                    >
                      {loading ? "…" : "open"}
                    </span>
                  </span>
                </button>
              </div>

              <p
                className="mt-8 text-right text-[13px] italic opacity-55"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                p.s. do not read this without me nearby.
              </p>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .shake { animation: shakeX 420ms ease; }

        /* torn / deckled edges via layered clip-path + drop-shadow */
        .aged-letter {
          filter: drop-shadow(0 30px 40px rgba(0,0,0,0.55)) drop-shadow(0 4px 6px rgba(0,0,0,0.35));
        }
        .aged-letter > div {
          clip-path: polygon(
            1% 3%, 4% 0%, 9% 2%, 14% 0.5%, 19% 2.5%, 24% 0%, 29% 2%, 34% 0.5%, 39% 3%, 44% 0%, 49% 2%, 54% 1%, 59% 3%, 64% 0.5%, 69% 2.5%, 74% 0%, 79% 2%, 84% 0.5%, 89% 3%, 94% 0.5%, 98% 2%, 100% 5%,
            99% 12%, 100% 22%, 98% 33%, 100% 44%, 99% 55%, 100% 66%, 98% 77%, 100% 88%, 99% 96%,
            96% 100%, 91% 98%, 86% 100%, 81% 97.5%, 76% 100%, 71% 98%, 66% 99.5%, 61% 97%, 56% 100%, 51% 98%, 46% 99.5%, 41% 97%, 36% 100%, 31% 98%, 26% 99.5%, 21% 97%, 16% 100%, 11% 98%, 6% 99.5%, 2% 97%, 0% 92%,
            1% 82%, 0% 71%, 2% 60%, 0% 49%, 1% 38%, 0% 27%, 2% 16%, 0% 8%
          );
        }
      `}</style>
    </div>
  );
}
