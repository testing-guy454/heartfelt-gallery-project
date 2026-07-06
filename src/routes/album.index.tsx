import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { listChapters } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import {
  FloatingPetals,
  Flourish,
  HeartIcon,
  Sprig,
  PhotoCorners,
  Butterfly,
} from "@/components/album/Ornaments";

export const Route = createFileRoute("/album/")({
  loader: async () => {
    try {
      return await listChapters();
    } catch {
      throw redirect({ to: "/unlock" });
    }
  },
  component: AlbumHome,
});

// Asymmetric scrapbook placement on a 12-col grid — same card design for
// every chapter, only position / size / rotation varies.
type Slot = {
  colStart: number;
  colSpan: number;
  rotate: number;
  translateY: number; // rem
};

const SLOTS: Slot[] = [
  { colStart: 1,  colSpan: 7, rotate: -1.8, translateY: 0    },
  { colStart: 8,  colSpan: 5, rotate:  2.1, translateY: 3    },
  { colStart: 2,  colSpan: 5, rotate:  1.4, translateY: -1.5 },
  { colStart: 7,  colSpan: 6, rotate: -1.6, translateY: 2    },
  { colStart: 1,  colSpan: 6, rotate:  1.2, translateY: 1    },
  { colStart: 8,  colSpan: 5, rotate: -2.2, translateY: -1   },
];

function AlbumHome() {
  const chapters = Route.useLoaderData();
  return (
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <Butterfly className="hidden md:block absolute right-16 top-28 w-10 text-[color:var(--pink-vivid)]/60 animate-[sway_8s_ease-in-out_infinite]" />
      <Butterfly className="hidden md:block absolute left-10 top-[52%] w-8 text-[color:var(--rose-deep)]/50 animate-[sway_11s_ease-in-out_infinite]" />
      <Sprig className="hidden lg:block absolute left-2 top-40 w-24 text-[color:var(--pink-vivid)]/30 rise-1" />
      <Sprig flip className="hidden lg:block absolute right-2 bottom-40 w-24 text-[color:var(--pink-vivid)]/30 rise-2" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-20 rise-1 relative">
          <p className="hand text-2xl text-[color:var(--pink-vivid)]">a little something for you</p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2">Our Chapters</h1>
          <Flourish className="mt-6 mb-4" />
          <p className="text-muted-foreground max-w-lg mx-auto italic leading-relaxed">
            Every chapter is a small piece of us. Take your time —
            it isn't going anywhere.
          </p>
          <div className="mt-6">
            <Link
              to="/album/timeline"
              className="hand text-lg text-[color:var(--pink-vivid)] hover:opacity-80 transition"
            >
              or wander the whole timeline →
            </Link>
          </div>
        </header>

        {chapters.length === 0 ? (
          <p className="text-center text-muted-foreground italic">No chapters yet.</p>
        ) : (
          <div className="relative grid grid-cols-12 gap-y-14 md:gap-y-20 gap-x-4 md:gap-x-6">
            {chapters.map((c: any, i: number) => {
              const s = SLOTS[i % SLOTS.length];
              return (
                <Link
                  key={c.id}
                  to="/album/c/$slug"
                  params={{ slug: c.slug }}
                  className={`chapter-cell group block relative rise-${Math.min((i % 4) + 2, 5)} transition duration-500 hover:-translate-y-1.5 hover:rotate-0`}
                  style={{
                    gridColumnStart: s.colStart,
                    gridColumnEnd: `span ${s.colSpan}`,
                    transform: `rotate(${s.rotate}deg) translateY(${s.translateY}rem)`,
                  } as React.CSSProperties}
                >
                  {/* Polaroid: image is a background layer, paper mat sits over it with a die-cut window */}
                  <div className="polaroid-card relative rounded-sm overflow-hidden shadow-[0_18px_30px_-18px_rgba(0,0,0,0.55)]">
                    {/* Background image layer — sits behind the paper mat, visible through the cutout */}
                    {c.cover_url && (
                      <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                          src={c.cover_url}
                          alt=""
                          aria-hidden
                          className="w-full h-full object-cover scale-110 group-hover:scale-[1.16] transition duration-[1400ms] ease-out sepia-[0.1] brightness-95"
                        />
                        {/* soft vignette on the background image */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(30,20,15,0.35)_100%)]" />
                      </div>
                    )}

                    {/* Paper mat with a rectangular window cut out */}
                    <div
                      className="aged-paper stitched relative z-10 p-4"
                      style={{
                        // Cut a rectangular window in the mat: keep paper everywhere EXCEPT the window rect
                        WebkitMaskImage:
                          "linear-gradient(#000,#000), linear-gradient(#000,#000)",
                        maskImage:
                          "linear-gradient(#000,#000), linear-gradient(#000,#000)",
                        WebkitMaskRepeat: "no-repeat, no-repeat",
                        maskRepeat: "no-repeat, no-repeat",
                        // First layer = full card; second = the window we subtract
                        WebkitMaskSize: "100% 100%, calc(100% - 32px) 55%",
                        maskSize: "100% 100%, calc(100% - 32px) 55%",
                        WebkitMaskPosition: "0 0, 16px 44px",
                        maskPosition: "0 0, 16px 44px",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      } as React.CSSProperties}
                    >
                      <span className="washi-tape" />

                      {/* Chapter number, handwritten — sits on the top mat band */}
                      <div className="hand text-2xl text-[color:var(--pink-vivid)] leading-none mb-2">
                        no. {String(i + 1).padStart(2, "0")}
                      </div>

                      {/* Spacer where the window is */}
                      <div style={{ height: "calc(0.55 * (100% ) )" }} className="aspect-[16/9]" />

                      {/* Bottom mat: title + description */}
                      <div className="pt-5 pb-2 relative">
                        <Sprig className="absolute -top-3 right-2 w-8 text-[color:var(--pink-vivid)]/30" />
                        <h2 className="serif italic text-3xl md:text-4xl text-ink group-hover:text-[color:var(--pink-vivid)] transition">
                          {c.title}
                        </h2>
                        {c.description && (
                          <p className="hand text-xl text-[color:var(--ink)]/75 mt-3 leading-snug">
                            {c.description}
                          </p>
                        )}
                        {c.creator_name && (
                          <p className="hand text-sm text-[color:var(--ink)]/55 mt-2 italic">
                            — a chapter by {c.creator_name}
                          </p>
                        )}
                        <div className="mt-5 flex items-center gap-2 text-[11px] stamp-font uppercase tracking-[0.25em] text-[color:var(--pink-vivid)]">
                          <HeartIcon className="w-3 h-3" />
                          open this chapter
                        </div>
                      </div>
                    </div>

                    {/* Bevel / inset shadow around the cutout window to sell the "die-cut through paper" depth */}
                    <div
                      className="pointer-events-none absolute z-20"
                      style={{
                        top: 44,
                        left: 16,
                        right: 16,
                        height: "55%",
                        boxShadow:
                          "inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 2px rgba(255,255,255,0.15)",
                        borderRadius: 2,
                      }}
                    >
                      <PhotoCorners />
                      {(c.date_start || c.date_end) && (
                        <div className="absolute bottom-3 left-3">
                          <span className="ribbon">{formatRange(c.date_start, c.date_end)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .chapter-cell {
            grid-column: 1 / -1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function formatRange(a?: string | null, b?: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  return fmt(a || b!);
}
