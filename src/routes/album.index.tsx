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

// Hand-tuned scrapbook layout — no symmetric grid. Each chapter gets its own
// column-span, rotation, offset, size, and treatment (polaroid / taped photo /
// torn-edge card). Cycle repeats after the array length.
type Layout = {
  colStart: number; // 1..12
  colSpan: number;
  rotate: number;
  translateY: number; // rem
  variant: "polaroid" | "taped" | "torn" | "postcard";
  size: "sm" | "md" | "lg";
  tapeColor: "pink" | "gold";
  captionSide: "left" | "right";
};

const LAYOUTS: Layout[] = [
  { colStart: 1,  colSpan: 6, rotate: -2.4, translateY: 0,   variant: "polaroid", size: "lg", tapeColor: "pink", captionSide: "right" },
  { colStart: 8,  colSpan: 5, rotate:  2.1, translateY: 3,   variant: "taped",    size: "md", tapeColor: "gold", captionSide: "left"  },
  { colStart: 3,  colSpan: 5, rotate: -1.3, translateY: -1.5,variant: "torn",     size: "md", tapeColor: "pink", captionSide: "right" },
  { colStart: 8,  colSpan: 5, rotate:  1.8, translateY: 2,   variant: "postcard", size: "sm", tapeColor: "gold", captionSide: "left"  },
  { colStart: 1,  colSpan: 5, rotate:  1.1, translateY: 1,   variant: "polaroid", size: "md", tapeColor: "gold", captionSide: "right" },
  { colStart: 7,  colSpan: 6, rotate: -1.9, translateY: -2,  variant: "taped",    size: "lg", tapeColor: "pink", captionSide: "left"  },
  { colStart: 2,  colSpan: 6, rotate:  2.4, translateY: 2,   variant: "torn",     size: "md", tapeColor: "pink", captionSide: "right" },
  { colStart: 8,  colSpan: 4, rotate: -1.4, translateY: 4,   variant: "postcard", size: "sm", tapeColor: "gold", captionSide: "left"  },
];

const SIZE_ASPECT: Record<Layout["size"], string> = {
  sm: "aspect-[4/5]",
  md: "aspect-[4/3]",
  lg: "aspect-[3/2]",
};

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
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-y-24 gap-x-6">
            {/* faint ruled paper lines behind the whole spread */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06] hidden md:block"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 31px, var(--sepia) 31px, var(--sepia) 32px)",
              }}
            />
            {chapters.map((c: any, i: number) => {
              const l = LAYOUTS[i % LAYOUTS.length];
              return (
                <ChapterEntry
                  key={c.id}
                  chapter={c}
                  index={i}
                  layout={l}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterEntry({
  chapter: c,
  index: i,
  layout: l,
}: {
  chapter: any;
  index: number;
  layout: Layout;
}) {
  const num = String(i + 1).padStart(2, "0");
  const dateStr = c.date_start || c.date_end ? formatRange(c.date_start, c.date_end) : null;

  return (
    <Link
      to="/album/c/$slug"
      params={{ slug: c.slug }}
      className={`group relative block md:col-span-${l.colSpan} rise-${Math.min((i % 4) + 2, 5)} transition duration-500 hover:-translate-y-1.5 hover:rotate-0`}
      style={{
        gridColumnStart: `var(--cs)`,
        transform: `rotate(${l.rotate}deg) translateY(${l.translateY}rem)`,
        ["--cs" as any]: l.colStart,
      } as React.CSSProperties}
    >
      <div className="relative">
        {/* variant frame */}
        {l.variant === "polaroid" && (
          <PolaroidFrame layout={l} num={num} title={c.title} description={c.description} dateStr={dateStr} cover={c.cover_url} />
        )}
        {l.variant === "taped" && (
          <TapedFrame layout={l} num={num} title={c.title} description={c.description} dateStr={dateStr} cover={c.cover_url} />
        )}
        {l.variant === "torn" && (
          <TornFrame layout={l} num={num} title={c.title} description={c.description} dateStr={dateStr} cover={c.cover_url} />
        )}
        {l.variant === "postcard" && (
          <PostcardFrame layout={l} num={num} title={c.title} description={c.description} dateStr={dateStr} cover={c.cover_url} />
        )}
      </div>
    </Link>
  );
}

type FrameProps = {
  layout: Layout;
  num: string;
  title: string;
  description?: string | null;
  dateStr: string | null;
  cover?: string | null;
};

function tapeClass(color: Layout["tapeColor"]) {
  return color === "pink" ? "washi-tape" : "washi-tape-gold";
}

function ChapterMeta({ num, dateStr }: { num: string; dateStr: string | null }) {
  return (
    <div className="flex items-baseline justify-between mb-1">
      <span className="stamp-font text-[0.6rem] tracking-[0.35em] uppercase text-[color:var(--sepia)]/85">
        chapter · no. {num}
      </span>
      {dateStr && (
        <span className="hand text-base text-[color:var(--pink-vivid)]/80">{dateStr}</span>
      )}
    </div>
  );
}

function OpenHint() {
  return (
    <span className="inline-flex items-center gap-2 stamp-font text-[10px] tracking-[0.3em] uppercase text-[color:var(--pink-vivid)] opacity-80 group-hover:opacity-100 transition">
      <HeartIcon className="w-3 h-3" />
      open
    </span>
  );
}

/* ---------- Frame variants ---------- */

function PolaroidFrame({ layout, num, title, description, dateStr, cover }: FrameProps) {
  return (
    <div className="polaroid relative">
      <span className={`${tapeClass(layout.tapeColor)}`} style={{ transform: `translateX(-50%) rotate(${layout.rotate > 0 ? -6 : 5}deg)` }} />
      <div className={`relative ${SIZE_ASPECT[layout.size]} overflow-hidden bg-muted`}>
        {cover && (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover sepia-[0.12] group-hover:sepia-0 group-hover:scale-[1.03] transition duration-[1200ms] ease-out"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--sepia)]/25 via-transparent to-transparent" />
      </div>
      <div className="pt-4 px-1">
        <ChapterMeta num={num} dateStr={dateStr} />
        <h2 className="hand text-4xl leading-tight text-ink group-hover:text-[color:var(--pink-vivid)] transition">
          {title}
        </h2>
        {description && (
          <p className="text-sm italic text-[color:var(--ink)]/70 mt-2 leading-snug line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-3">
          <OpenHint />
        </div>
      </div>
    </div>
  );
}

function TapedFrame({ layout, num, title, description, dateStr, cover }: FrameProps) {
  const captionRight = layout.captionSide === "right";
  return (
    <div className="relative">
      {/* two pieces of tape at corners */}
      <span
        className={`${tapeClass(layout.tapeColor)} !w-16 !h-5`}
        style={{ left: "12%", top: "-0.5rem", transform: `translateX(0) rotate(${layout.rotate > 0 ? -18 : -12}deg)` }}
      />
      <span
        className={`${tapeClass(layout.tapeColor === "pink" ? "gold" : "pink")} !w-16 !h-5`}
        style={{ left: "auto", right: "8%", top: "-0.6rem", transform: `translateX(0) rotate(${layout.rotate > 0 ? 14 : 22}deg)` }}
      />
      <div className={`relative ${SIZE_ASPECT[layout.size]} overflow-hidden bg-muted shadow-[0_18px_30px_-20px_rgba(60,30,20,0.55)]`}>
        {cover && (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover sepia-[0.1] group-hover:sepia-0 group-hover:scale-[1.04] transition duration-[1200ms] ease-out"
          />
        )}
        <PhotoCorners />
        <div className="absolute inset-0 ring-1 ring-inset ring-[color:var(--sepia)]/25 pointer-events-none" />
        {/* chapter number tag over photo */}
        <div
          className="absolute -bottom-3 z-20"
          style={{ [captionRight ? "left" : "right"]: "1rem" } as React.CSSProperties}
        >
          <span className="inline-block bg-[color:var(--letter-paper)] px-3 py-1 stamp-font text-[10px] tracking-[0.3em] uppercase text-[color:var(--sepia)] shadow-[0_4px_10px_-6px_rgba(0,0,0,0.4)] border border-[color:var(--sepia)]/25">
            no. {num}
          </span>
        </div>
      </div>

      {/* handwritten caption in margin */}
      <div
        className={`mt-6 ${captionRight ? "ml-auto text-right pr-2" : "mr-auto text-left pl-2"} max-w-[85%]`}
      >
        <h2 className="serif italic text-3xl md:text-4xl text-ink group-hover:text-[color:var(--pink-vivid)] transition leading-tight">
          {title}
        </h2>
        {dateStr && (
          <p className="hand text-lg text-[color:var(--pink-vivid)]/85 mt-1">{dateStr}</p>
        )}
        {description && (
          <p className="hand text-xl text-[color:var(--ink)]/75 mt-2 leading-snug line-clamp-3">
            {description}
          </p>
        )}
        <div className={`mt-3 flex ${captionRight ? "justify-end" : "justify-start"}`}>
          <OpenHint />
        </div>
      </div>
    </div>
  );
}

function TornFrame({ layout, num, title, description, dateStr, cover }: FrameProps) {
  return (
    <div className="aged-paper relative p-5 pb-6 torn-clip">
      <div className="flex items-start gap-4">
        <div className={`relative ${SIZE_ASPECT[layout.size]} w-3/5 overflow-hidden bg-muted flex-shrink-0`}>
          {cover && (
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover sepia-[0.14] group-hover:sepia-[0.02] group-hover:scale-[1.03] transition duration-[1200ms] ease-out"
            />
          )}
          <PhotoCorners />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <ChapterMeta num={num} dateStr={dateStr} />
          <h2 className="serif italic text-2xl md:text-3xl text-ink group-hover:text-[color:var(--pink-vivid)] transition leading-tight">
            {title}
          </h2>
          {description && (
            <p className="hand text-lg text-[color:var(--ink)]/75 mt-2 leading-snug line-clamp-4">
              {description}
            </p>
          )}
          <div className="mt-3">
            <OpenHint />
          </div>
        </div>
      </div>
    </div>
  );
}

function PostcardFrame({ layout, num, title, description, dateStr, cover }: FrameProps) {
  return (
    <div className="aged-paper stitched relative p-3 pb-4">
      <div className={`relative ${SIZE_ASPECT[layout.size]} overflow-hidden bg-muted`}>
        {cover && (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover sepia-[0.1] group-hover:sepia-0 group-hover:scale-[1.04] transition duration-[1200ms] ease-out"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--sepia)]/25 via-transparent to-transparent" />
      </div>
      <div className="px-1 pt-3">
        <ChapterMeta num={num} dateStr={dateStr} />
        <h2 className="serif italic text-2xl text-ink group-hover:text-[color:var(--pink-vivid)] transition leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs italic text-[color:var(--ink)]/70 mt-1.5 leading-snug line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-2">
          <OpenHint />
        </div>
      </div>
    </div>
  );
}

function formatRange(a?: string | null, b?: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  return fmt(a || b!);
}
