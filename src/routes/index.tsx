import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FloatingPetals,
  HeartIcon,
  Sprig,
  CornerOrnament,
  Flourish,
  PostageStamp,
  Postmark,
  Butterfly,
} from "@/components/album/Ornaments";

export const Route = createFileRoute("/")({
  component: Cover,
});

function Cover() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">
      <FloatingPetals />

      {/* Side sprigs */}
      <Sprig className="hidden md:block absolute left-6 top-16 w-24 text-[color:var(--pink-vivid)]/50 rise-1" />
      <Sprig
        flip
        className="hidden md:block absolute right-6 bottom-16 w-24 text-[color:var(--pink-vivid)]/50 rise-2"
      />
      <Butterfly className="hidden md:block absolute right-24 top-24 w-12 text-[color:var(--pink-vivid)]/70 animate-[sway_7s_ease-in-out_infinite]" />
      <Butterfly className="hidden md:block absolute left-32 bottom-32 w-9 text-[color:var(--rose-deep)]/60 animate-[sway_9s_ease-in-out_infinite]" />

      <div className="relative z-10 max-w-xl w-full">
        {/* Envelope flap */}
        <div className="relative mx-auto w-full">
          <div
            className="mx-auto h-24 w-full"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--pink-vivid) 88%, black), color-mix(in oklab, var(--rose-deep) 80%, black))",
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

        {/* Letter body — aged paper with folds, stains, stamps */}
        <div className="aged-paper fold-crease relative rounded-b-2xl px-8 md:px-14 pt-24 pb-14 text-center rise-3 overflow-hidden">
          <CornerOrnament position="tl" />
          <CornerOrnament position="tr" />
          <CornerOrnament position="bl" />
          <CornerOrnament position="br" />

          {/* Postage stamp + postmark, tucked in the top-right */}
          <div className="absolute top-5 right-5 flex flex-col items-end gap-2 z-10">
            <div style={{ transform: "rotate(6deg)" }}>
              <PostageStamp />
            </div>
            <Postmark city="Us · Always" label="Air Mail" />
          </div>

          {/* Handwritten address block, top-left */}
          <div className="absolute top-6 left-6 text-left hand text-lg text-[color:var(--ink)]/70 leading-snug rotate-[-2deg] hidden md:block">
            <div>To — my dearest,</div>
            <div className="opacity-70">c/o the corner of my heart</div>
            <div className="opacity-60">no. 143, forever lane</div>
          </div>

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

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link to="/unlock" className="btn-love">
              <HeartIcon className="w-4 h-4" />
              Open the album
            </Link>
            <p className="hand text-xl text-[color:var(--pink-vivid)]/90">
              — always, always yours
            </p>
          </div>

          <div className="gold-divider my-8 mx-auto w-40" />
          <p className="stamp-font text-[10px] uppercase tracking-[0.35em] text-[color:var(--sepia)]/80">
            a keepsake · hand-made · no. 001
          </p>
        </div>
      </div>
    </div>
  );
}
