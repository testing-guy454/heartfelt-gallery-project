import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { listChapters } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import {
  FloatingPetals,
  Flourish,
  Sprig,
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

// Chapter shape from listChapters()
type Chapter = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  date_start?: string | null;
  date_end?: string | null;
};

// Five hand-composed scrapbook slots — chapters cycle through them.
// Each slot places itself absolutely into a shared 12x6 grid.
const SLOTS = [
  // 0: Large focal spread (portrait, upper-left)
  {
    grid: "col-start-1 col-end-6 row-start-1 row-span-4",
    z: "z-20",
    tilt: -2,
    kind: "focal" as const,
  },
  // 1: Small memo notecard (upper-mid, offset down)
  {
    grid: "col-start-6 col-end-10 row-start-1 row-span-2 pt-8",
    z: "z-10",
    tilt: 3,
    kind: "memo" as const,
  },
  // 2: Wide split entry (photo + text)
  {
    grid: "col-start-6 col-end-13 row-start-3 row-span-3 -ml-8",
    z: "z-30",
    tilt: -1,
    kind: "wide" as const,
  },
  // 3: Small polaroid (lower-left, overlapping)
  {
    grid: "col-start-2 col-end-5 row-start-5 row-span-2 -mt-4",
    z: "z-40",
    tilt: 6,
    kind: "polaroid" as const,
  },
  // 4: Vertical finale card
  {
    grid: "col-start-9 col-end-12 row-start-5 row-span-2",
    z: "z-20",
    tilt: -1,
    kind: "finale" as const,
  },
];

const HAND = { fontFamily: "'Dancing Script', 'Caveat', cursive" };
const SERIF = { fontFamily: "'EB Garamond', 'Cormorant Garamond', serif" };
const STAMP = { fontFamily: "'Special Elite', monospace" };

function AlbumHome() {
  const chapters = Route.useLoaderData() as Chapter[];

  return (
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <Butterfly className="hidden md:block absolute right-16 top-28 w-10 text-[color:var(--pink-vivid)]/60 animate-[sway_8s_ease-in-out_infinite]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14">
        {/* Header */}
        <header className="text-center mb-14 rise-1 relative">
          <Sprig className="hidden md:block absolute -left-4 -top-2 w-16 text-[color:var(--pink-vivid)]/40" />
          <Sprig flip className="hidden md:block absolute -right-4 -top-2 w-16 text-[color:var(--pink-vivid)]/40" />
          <p style={HAND} className="text-2xl text-[color:var(--pink-vivid)]">a little something for you</p>
          <h1 style={SERIF} className="italic text-5xl md:text-7xl text-ink mt-2">Our Chapters</h1>
          <Flourish className="mt-5 mb-3" />
          <p style={SERIF} className="text-[color:var(--ink)]/70 max-w-lg mx-auto italic leading-relaxed">
            Every chapter is a small piece of us. Take your time —
            it isn't going anywhere.
          </p>
          <div className="mt-5">
            <Link
              to="/album/timeline"
              style={HAND}
              className="inline-flex items-center gap-2 text-xl text-[color:var(--pink-vivid)] hover:opacity-80 transition"
            >
              or wander the whole timeline →
            </Link>
          </div>
        </header>

        {chapters.length === 0 ? (
          <p className="text-center text-muted-foreground italic">No chapters yet.</p>
        ) : (
          <>
            {/* Scrapbook memory board — a compositional grid, not a card grid */}
            <div className="relative w-full grid grid-cols-12 grid-rows-6 gap-2 min-h-[900px] md:min-h-[1000px]">
              {chapters.map((c, i) => {
                const slot = SLOTS[i % SLOTS.length];
                return (
                  <div key={c.id} className={`${slot.grid} ${slot.z}`}>
                    <ChapterPiece chapter={c} index={i} slot={slot} />
                  </div>
                );
              })}
            </div>

            {/* If more than 5 chapters, spill them below in a second spread */}
            {chapters.length > SLOTS.length && (
              <div className="mt-16 pt-10 border-t border-[color:var(--sepia)]/20 relative">
                <p
                  style={STAMP}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[color:var(--background)] px-4 text-[10px] tracking-[0.4em] uppercase text-[color:var(--sepia)]"
                >
                  · continued ·
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* subtle inset vignette to sell the paper feel */}
      <div className="pointer-events-none fixed inset-0 shadow-[inset_0_0_140px_rgba(61,42,32,0.07)] z-[1]" />
    </div>
  );
}

function ChapterPiece({
  chapter: c,
  index: i,
  slot,
}: {
  chapter: Chapter;
  index: number;
  slot: (typeof SLOTS)[number];
}) {
  const number = String(i + 1).padStart(2, "0");
  const dateLabel = formatRange(c.date_start, c.date_end);
  const to = "/album/c/$slug" as const;
  const params = { slug: c.slug };

  const commonHover =
    "block group relative transition-transform duration-500 will-change-transform";

  switch (slot.kind) {
    case "focal":
      return (
        <Link
          to={to}
          params={params}
          className={`${commonHover} hover:rotate-0 hover:-translate-y-1`}
          style={{ transform: `rotate(${slot.tilt}deg)` }}
        >
          {/* washi tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-[color:var(--gold)]/40 border-x border-[color:var(--gold)]/25 rotate-[-1deg] z-30 shadow-sm" />
          <div className="bg-[color:var(--letter-paper)] p-4 shadow-[0_24px_50px_-24px_rgba(61,42,32,0.45)] border border-[color:var(--sepia)]/15 relative">
            <PaperGrain />
            <div className="aspect-[4/5] w-full overflow-hidden bg-[color:var(--sepia)]/10 border border-[color:var(--ink)]/10 relative">
              {c.cover_url ? (
                <img
                  src={c.cover_url}
                  alt={c.title}
                  className="w-full h-full object-cover sepia-[0.1] group-hover:scale-105 transition duration-[1200ms] ease-out"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-[color:var(--sepia)]" style={HAND}>
                  no photo yet
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--sepia)]/20 via-transparent to-transparent" />
            </div>
            <div className="px-2 mt-4">
              <div className="flex justify-between items-center mb-1">
                <span style={STAMP} className="text-[10px] text-[color:var(--sepia)] tracking-[0.28em] uppercase">
                  chapter {number}
                </span>
                {dateLabel && (
                  <span style={HAND} className="text-lg text-[color:var(--pink-vivid)]">
                    {dateLabel}
                  </span>
                )}
              </div>
              <h2 style={SERIF} className="text-3xl text-ink font-semibold italic leading-tight">
                {c.title}
              </h2>
              {c.description && (
                <p style={SERIF} className="text-sm text-[color:var(--ink)]/70 mt-2 leading-relaxed italic">
                  {c.description}
                </p>
              )}
            </div>
          </div>
        </Link>
      );

    case "memo":
      return (
        <Link
          to={to}
          params={params}
          className={`${commonHover} hover:scale-[1.03]`}
          style={{ transform: `rotate(${slot.tilt}deg)` }}
        >
          <div className="bg-[color:var(--letter-paper)] p-6 shadow-lg border-l-4 border-[color:var(--rose-deep)]/60 relative">
            <PaperGrain />
            <span style={STAMP} className="text-[9px] text-[color:var(--sepia)] tracking-[0.3em] uppercase">
              memo · no. {number}
            </span>
            <h2
              style={SERIF}
              className="text-2xl text-ink mt-1 mb-2 underline decoration-[color:var(--gold)]/40 underline-offset-4 group-hover:text-[color:var(--pink-vivid)] transition"
            >
              {c.title}
            </h2>
            {c.description && (
              <p style={HAND} className="text-xl text-[color:var(--ink)]/85 leading-snug">
                {c.description}
              </p>
            )}
            {dateLabel && (
              <p style={STAMP} className="mt-3 text-[9px] text-[color:var(--sepia)] tracking-[0.25em] uppercase">
                {dateLabel}
              </p>
            )}
          </div>
        </Link>
      );

    case "wide":
      return (
        <Link
          to={to}
          params={params}
          className={`${commonHover} hover:rotate-[1deg]`}
          style={{ transform: `rotate(${slot.tilt}deg)` }}
        >
          {/* twine */}
          <div className="absolute -left-4 top-1/2 w-12 h-px bg-[color:var(--sepia)]/40 -rotate-12" />
          <div className="bg-[color:var(--letter-paper)] p-3 shadow-2xl border border-[color:var(--sepia)]/25 flex gap-4 relative">
            <PaperGrain />
            <div className="w-2/5 shrink-0">
              <div className="aspect-square w-full overflow-hidden bg-[color:var(--sepia)]/10 border-4 border-white shadow-inner">
                {c.cover_url ? (
                  <img
                    src={c.cover_url}
                    alt={c.title}
                    className="w-full h-full object-cover sepia-[0.1] group-hover:scale-105 transition duration-[1200ms] ease-out"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-[color:var(--sepia)]" style={HAND}>
                    no photo
                  </div>
                )}
              </div>
            </div>
            <div className="w-3/5 flex flex-col justify-center pr-3 py-2">
              <span style={STAMP} className="text-[10px] text-[color:var(--sepia)] mb-1 tracking-[0.28em] uppercase">
                entry no. {number}
              </span>
              <h2 style={SERIF} className="text-2xl text-ink font-bold tracking-tight leading-tight group-hover:text-[color:var(--pink-vivid)] transition">
                {c.title}
              </h2>
              {dateLabel && (
                <p style={SERIF} className="text-[color:var(--ink)]/60 italic text-xs mt-1 mb-2">
                  {dateLabel}
                </p>
              )}
              {c.description && (
                <p style={SERIF} className="text-sm text-[color:var(--ink)]/80 leading-normal">
                  {c.description}
                </p>
              )}
            </div>
          </div>
        </Link>
      );

    case "polaroid":
      return (
        <Link
          to={to}
          params={params}
          className={`${commonHover} hover:scale-105`}
          style={{ transform: `rotate(${slot.tilt}deg)` }}
        >
          <div className="bg-white p-3 pb-10 shadow-xl border border-black/5 relative">
            <div className="aspect-square w-full overflow-hidden bg-neutral-100">
              {c.cover_url ? (
                <img
                  src={c.cover_url}
                  alt={c.title}
                  className="w-full h-full object-cover sepia-[0.12] group-hover:scale-105 transition duration-[1200ms] ease-out"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-neutral-400" style={HAND}>
                  polaroid
                </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <p style={HAND} className="text-[color:var(--ink)] text-xl font-bold leading-tight">
                {c.title}
              </p>
              {dateLabel && (
                <p style={STAMP} className="text-[8px] mt-1 tracking-[0.3em] uppercase text-[color:var(--sepia)]">
                  {dateLabel}
                </p>
              )}
            </div>
          </div>
        </Link>
      );

    case "finale":
    default:
      return (
        <Link
          to={to}
          params={params}
          className={`${commonHover} hover:-translate-y-2`}
          style={{ transform: `rotate(${slot.tilt}deg)` }}
        >
          <div className="bg-[color:var(--letter-paper)] p-5 shadow-xl border-t-8 border-[color:var(--rose-deep)] relative">
            <PaperGrain />
            <h2 style={SERIF} className="text-center text-2xl text-ink italic font-semibold mb-3 group-hover:text-[color:var(--pink-vivid)] transition">
              {c.title}
            </h2>
            <div className="w-full h-32 overflow-hidden bg-[color:var(--sepia)]/10">
              {c.cover_url ? (
                <img
                  src={c.cover_url}
                  alt={c.title}
                  className="w-full h-full object-cover sepia-[0.15] grayscale-[15%] group-hover:scale-105 transition duration-[1200ms] ease-out"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-[color:var(--sepia)]" style={HAND}>
                  ·
                </div>
              )}
            </div>
            {c.description && (
              <p style={SERIF} className="mt-3 text-xs text-[color:var(--ink)]/70 italic leading-relaxed text-center">
                {c.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-center space-x-2">
              <div className="h-px w-8 bg-[color:var(--sepia)]/40" />
              <span style={STAMP} className="text-[9px] text-[color:var(--sepia)] tracking-[0.3em] uppercase">
                ch. {number}
              </span>
              <div className="h-px w-8 bg-[color:var(--sepia)]/40" />
            </div>
          </div>
        </Link>
      );
  }
}

function PaperGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0 0.14 0 0 0 0.1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

function formatRange(a?: string | null, b?: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  if (a || b) return fmt((a || b)!);
  return "";
}
