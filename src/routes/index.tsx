import { createFileRoute, Link } from "@tanstack/react-router";
import { FloatingPetals, HeartIcon, Sprig, CornerOrnament, Flourish } from "@/components/album/Ornaments";

export const Route = createFileRoute("/")({
  component: Cover,
});

function Cover() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">
      <FloatingPetals />

      {/* Side sprigs */}
      <Sprig className="hidden md:block absolute left-6 top-16 w-24 text-[color:var(--rose-deep)]/40 rise-1" />
      <Sprig
        flip
        className="hidden md:block absolute right-6 bottom-16 w-24 text-[color:var(--rose-deep)]/40 rise-2"
      />

      <div className="relative z-10 max-w-xl w-full">
        {/* Envelope flap */}
        <div className="relative mx-auto w-full">
          <div
            className="mx-auto h-24 w-full"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--rose-deep) 92%, black), color-mix(in oklab, var(--rose-deep) 70%, black))",
              filter: "drop-shadow(0 6px 10px color-mix(in oklab, var(--ink) 35%, transparent))",
            }}
          />
          {/* wax seal */}
          <div className="absolute left-1/2 top-16 -translate-x-1/2 animate-[heartbeat_2.4s_ease-in-out_infinite]">
            <span className="wax-seal">
              <HeartIcon className="w-8 h-8" />
            </span>
          </div>
        </div>

        {/* Letter body */}
        <div className="paper-deep relative rounded-b-2xl px-8 md:px-14 pt-20 pb-14 text-center rise-3">
          <CornerOrnament position="tl" />
          <CornerOrnament position="tr" />
          <CornerOrnament position="bl" />
          <CornerOrnament position="br" />

          <p className="hand text-3xl text-[color:var(--rose-deep)]/80">for you, my love —</p>

          <h1 className="serif text-6xl md:text-7xl mt-3 text-ink italic leading-[1.05]">
            Our
            <span className="mx-3 text-[color:var(--rose-deep)]">&amp;</span>
            Always
          </h1>

          <Flourish className="mt-6 mb-4" />

          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto italic">
            Every quiet morning, every messy laugh, every somewhere-we-got-lost.
            A little home for the moments I never want to forget — and all the
            ones we haven't lived yet.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link to="/unlock" className="btn-love">
              <HeartIcon className="w-4 h-4" />
              Open the album
            </Link>
            <p className="hand text-xl text-[color:var(--rose-deep)]/70">
              — always, always yours
            </p>
          </div>

          <div className="gold-divider my-8 mx-auto w-40" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
            a keepsake, hand-made
          </p>
        </div>
      </div>
    </div>
  );
}
