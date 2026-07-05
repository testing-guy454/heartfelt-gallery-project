import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getChapter } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import {
  FloatingPetals,
  Flourish,
  HeartIcon,
  Sprig,
  PhotoCorners,
  Postmark,
  PostageStamp,
  Butterfly,
} from "@/components/album/Ornaments";

// A small paperclip svg — one of the per-card embellishments.
function Paperclip({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 80" className={className} aria-hidden>
      <path
        d="M20 6 C 10 6, 6 14, 6 26 L 6 60 C 6 70, 14 74, 20 74 C 26 74, 32 70, 32 60 L 32 22 C 32 16, 28 12, 22 12 C 16 12, 14 16, 14 22 L 14 58"
        fill="none"
        stroke="color-mix(in oklab, var(--gold) 70%, #7a5a20)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// One decoration per card, cycled by index. Keeps composition uncluttered.
type Deco = "tape-cream" | "tape-gold" | "tape-pink" | "clip" | "stamp" | "corners" | "sprig";
const DECOS: Deco[] = ["tape-cream", "clip", "tape-pink", "corners", "stamp", "tape-gold", "sprig"];

export const Route = createFileRoute("/album/c/$slug")({
  loader: async ({ params }) => {
    try {
      return await getChapter({ data: { slug: params.slug } });
    } catch (e: any) {
      if (e?.message === "locked") throw redirect({ to: "/unlock" });
      throw e;
    }
  },
  component: ChapterView,
});

const TAPE_VARIANTS = ["washi-tape", "washi-tape-gold"];
void TAPE_VARIANTS;

function ChapterView() {
  const { chapter, photos } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % photos.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, photos.length]);

  return (
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <Butterfly className="hidden md:block absolute right-14 top-28 w-10 text-[color:var(--pink-vivid)]/60 animate-[sway_8s_ease-in-out_infinite]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <Link
          to="/album"
          className="hand text-lg text-[color:var(--pink-vivid)] hover:opacity-80"
        >
          ← all chapters
        </Link>

        <header className="relative text-center my-12 rise-1">
          <Sprig className="hidden md:block absolute -left-4 -top-6 w-16 text-[color:var(--pink-vivid)]/45" />
          <Sprig
            flip
            className="hidden md:block absolute -right-4 -top-6 w-16 text-[color:var(--pink-vivid)]/45"
          />
          <p className="hand text-2xl text-[color:var(--pink-vivid)]">a chapter of us</p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2 leading-tight">
            {chapter.title}
          </h1>
          {(chapter.date_start || chapter.date_end) && (
            <p className="hand text-2xl text-[color:var(--rose-deep)]/70 mt-3">
              {formatRange(chapter.date_start, chapter.date_end)}
            </p>
          )}
          <Flourish className="mt-5 mb-4" />
          {chapter.description && (
            <p className="text-muted-foreground max-w-xl mx-auto italic leading-relaxed">
              {chapter.description}
            </p>
          )}
        </header>

        {chapter.song_url && (
          <div className="mb-12 aged-paper fold-crease rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 rise-2 relative overflow-hidden">
            <span className="washi-tape-gold" />
            <div className="flex items-center gap-2 shrink-0">
              <HeartIcon className="w-4 h-4 text-[color:var(--pink-vivid)] animate-[heartbeat_2.4s_ease-in-out_infinite]" />
              <span className="hand text-xl text-[color:var(--pink-vivid)]">
                a song for this chapter
              </span>
            </div>
            <audio controls src={chapter.song_url} className="flex-1 w-full" />
            <div className="hidden md:block absolute right-4 bottom-3">
              <Postmark city="Side A" label="Play me" />
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <p className="text-center text-muted-foreground italic">
            No photos in this chapter yet.
          </p>
        ) : (
          <div className="columns-1 md:columns-2 gap-12 [column-fill:_balance]">
            {photos.map((p: any, i: number) => {
              const tilt = ((i % 5) - 2) * 1.4;
              const deco: Deco = DECOS[i % DECOS.length];
              return (
                <figure
                  key={p.id}
                  className="mb-14 break-inside-avoid inline-block w-full rise-2 relative"
                  style={{ transform: `rotate(${tilt}deg)` }}
                >
                  {/* Layered paper card — photo is tucked behind, not pasted on top */}
                  <div
                    className="aged-paper relative"
                    style={{
                      padding: "18px 18px 22px 18px",
                      boxShadow:
                        "0 1px 0 rgba(0,0,0,0.05), 0 22px 40px -22px color-mix(in oklab, var(--sepia) 60%, transparent), 0 8px 18px -10px color-mix(in oklab, var(--ink) 25%, transparent)",
                    }}
                  >
                    {/* Per-card embellishment (only one, kept subtle) */}
                    {deco === "tape-cream" && (
                      <span
                        className="washi-tape"
                        style={{ top: -12, left: "18%", width: 110, transform: "rotate(-6deg)" }}
                      />
                    )}
                    {deco === "tape-gold" && (
                      <span
                        className="washi-tape-gold"
                        style={{ top: -14, right: "16%", width: 120, transform: "rotate(5deg)" }}
                      />
                    )}
                    {deco === "tape-pink" && (
                      <span
                        className="washi-tape"
                        style={{
                          top: -10,
                          left: "40%",
                          width: 130,
                          transform: "rotate(-3deg)",
                          background:
                            "repeating-linear-gradient(45deg, color-mix(in oklab, var(--pink-vivid) 32%, white) 0 6px, color-mix(in oklab, var(--pink-vivid) 18%, white) 6px 12px)",
                          opacity: 0.85,
                        }}
                      />
                    )}
                    {deco === "clip" && (
                      <div className="absolute" style={{ top: -14, left: "50%", transform: "translateX(-50%) rotate(-4deg)" }}>
                        <Paperclip className="w-6 h-12" />
                      </div>
                    )}
                    {deco === "stamp" && (
                      <div
                        className="absolute"
                        style={{ top: 8, right: 8, transform: "rotate(6deg)", opacity: 0.9 }}
                      >
                        <PostageStamp />
                      </div>
                    )}
                    {deco === "sprig" && (
                      <div className="absolute" style={{ bottom: -18, left: -18, transform: "rotate(-20deg)" }}>
                        <Sprig className="w-12 text-[color:var(--pink-vivid)]/50" />
                      </div>
                    )}

                    {/* Photo window — image extends behind an inner paper frame,
                        no crisp digital rectangle at the edges */}
                    <div className="relative">
                      <button
                        onClick={() => setLightbox(i)}
                        className="block w-full relative overflow-hidden"
                        style={{ background: "color-mix(in oklab, var(--sepia) 20%, #1a1310)" }}
                      >
                        <img
                          src={p.image_url}
                          alt={p.title ?? ""}
                          className="w-full object-cover hover:scale-[1.04] transition duration-[900ms] ease-out sepia-[0.1] brightness-95"
                        />
                        {/* Inner paper bevel — sells "photo tucked under the frame" */}
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            boxShadow:
                              "inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -2px 6px rgba(0,0,0,0.35), inset 0 0 30px rgba(30,20,15,0.35)",
                          }}
                        />
                        {/* Soft top tint so photo blends into the paper tone */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--sepia)]/15 via-transparent to-[color:var(--sepia)]/10 pointer-events-none" />
                      </button>
                      {deco === "corners" && <PhotoCorners />}
                    </div>

                    {/* Text is printed on the paper beneath the photo */}
                    <figcaption className="pt-4 px-1 text-center relative">
                      {p.title && (
                        <h3 className="serif italic text-2xl text-ink leading-tight">{p.title}</h3>
                      )}
                      {p.taken_at && (
                        <p className="stamp-font text-[10px] uppercase tracking-[0.28em] text-[color:var(--sepia)] mt-1">
                          {new Date(p.taken_at).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                      {p.caption && (
                        <p className="hand text-xl text-[color:var(--ink)]/75 mt-2 leading-snug">
                          {p.caption}
                        </p>
                      )}
                    </figcaption>
                  </div>
                </figure>
              );
            })}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-ink/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-[fadeIn_300ms_ease]"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-[color:var(--gold)] hand text-2xl"
            onClick={() => setLightbox(null)}
          >
            close ×
          </button>
          <img
            src={photos[lightbox].image_url}
            alt=""
            className="max-h-[85vh] max-w-full object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function formatRange(a?: string | null, b?: string | null) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  if (a || b) return fmt((a || b)!);
  return "";
}
