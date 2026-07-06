import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, type CSSProperties } from "react";
import { getChapter } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import { FavoriteButton } from "@/components/album/FavoriteButton";
import {
  FloatingPetals,
  Flourish,
  HeartIcon,
  Sprig,
  Postmark,
  Butterfly,
} from "@/components/album/Ornaments";


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

/* ============================================================
   Small SVG embellishments that recreate the reference cards
   ============================================================ */

function Paperclip({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 90" width="26" height="58" style={style} aria-hidden>
      <path
        d="M20 6 C 10 6, 6 14, 6 26 L 6 66 C 6 78, 16 84, 22 84 C 30 84, 34 78, 34 68 L 34 22 C 34 16, 30 12, 24 12 C 18 12, 14 16, 14 22 L 14 62"
        fill="none"
        stroke="#c8a24a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M20 6 C 10 6, 6 14, 6 26 L 6 66 C 6 78, 16 84, 22 84 C 30 84, 34 78, 34 68 L 34 22 C 34 16, 30 12, 24 12 C 18 12, 14 16, 14 22 L 14 62"
        fill="none"
        stroke="#fff3c8"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** Small hand-drawn heart in ink */
function InkHeart({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 36" width="28" height="26" style={style} aria-hidden>
      <path
        d="M20 32 C 6 22, 2 14, 6 8 C 10 3, 18 5, 20 11 C 22 5, 30 3, 34 8 C 38 14, 34 22, 20 32 Z"
        fill="none"
        stroke="#6a4a2a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M12 12 q 3 4 6 6" fill="none" stroke="#6a4a2a" strokeWidth="0.9" opacity="0.6" />
    </svg>
  );
}

/** Gold triangular photo corners (deeper than the base .photo-corner) */
function GoldCorners() {
  const c: CSSProperties = {
    position: "absolute",
    width: 26,
    height: 26,
    background:
      "linear-gradient(135deg, #b88a3a 0 46%, #8a6624 46% 52%, transparent 52%)",
    boxShadow: "inset 0 0 3px rgba(0,0,0,0.35)",
  };
  return (
    <>
      <span style={{ ...c, top: -1, left: -1 }} />
      <span style={{ ...c, top: -1, right: -1, transform: "scaleX(-1)" }} />
      <span style={{ ...c, bottom: -1, left: -1, transform: "scaleY(-1)" }} />
      <span style={{ ...c, bottom: -1, right: -1, transform: "scale(-1,-1)" }} />
    </>
  );
}

/** Dried floral sprig — configurable palette. Draws a stem with tiny blossoms. */
function DriedSprig({
  style,
  petal = "#b494c8",
  bud = "#efe0d0",
  stem = "#7a6a4a",
}: {
  style?: CSSProperties;
  petal?: string;
  bud?: string;
  stem?: string;
}) {
  return (
    <svg viewBox="0 0 90 220" width="72" height="180" style={style} aria-hidden>
      <g fill="none" stroke={stem} strokeWidth="1.2" strokeLinecap="round">
        <path d="M45 215 C 42 170, 50 120, 44 60 C 42 40, 46 20, 44 6" />
        <path d="M45 190 C 30 180, 22 168, 18 152" />
        <path d="M45 170 C 60 162, 66 148, 68 132" />
        <path d="M45 140 C 30 130, 24 116, 22 100" />
        <path d="M45 118 C 62 108, 68 96, 70 80" />
        <path d="M45 92 C 34 82, 30 68, 30 52" />
        <path d="M45 68 C 58 58, 62 44, 62 30" />
      </g>
      <g fill={petal} opacity="0.92">
        {/* clusters of tiny 4-petal blossoms */}
        {[
          [18, 152],
          [68, 132],
          [22, 100],
          [70, 80],
          [30, 52],
          [62, 30],
          [45, 14],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <circle cx="-3" cy="-2" r="2.6" />
            <circle cx="3" cy="-2" r="2.6" />
            <circle cx="-2" cy="3" r="2.4" />
            <circle cx="3" cy="3" r="2.4" />
            <circle cx="0" cy="0" r="1.2" fill={bud} />
          </g>
        ))}
      </g>
      <g fill={bud} opacity="0.85">
        <circle cx="45" cy="6" r="2" />
        <circle cx="42" cy="10" r="1.6" />
        <circle cx="48" cy="9" r="1.4" />
      </g>
    </svg>
  );
}

/** "LOVE POST" style vintage postage stamp with a floral cameo. */
function LovePostStamp({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        padding: 6,
        background: "#efe1c8",
        boxShadow: "0 4px 8px -4px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(120,80,40,0.25)",
        // perforated edge
        WebkitMask:
          "radial-gradient(circle at 4px 4px, transparent 3px, #000 3.5px) 0 0/8px 8px",
        mask: "radial-gradient(circle at 4px 4px, transparent 3px, #000 3.5px) 0 0/8px 8px",
        ...style,
      }}
      aria-hidden
    >
      <div
        style={{
          border: "1px solid rgba(120,80,40,0.55)",
          padding: "10px 8px 4px",
          textAlign: "center",
          fontFamily: "'Special Elite', 'Courier New', monospace",
          color: "#5a3a1a",
          width: 78,
        }}
      >
        <div style={{ fontSize: 8, letterSpacing: "0.2em" }}>LOVE</div>
        <svg viewBox="0 0 60 60" width="56" height="46" style={{ display: "block", margin: "2px auto" }}>
          <g fill="none" stroke="#8a4a5a" strokeWidth="1">
            <path d="M30 46 C 18 34, 14 24, 20 16 C 26 8, 36 12, 30 24 C 24 12, 34 8, 40 16 C 46 24, 42 34, 30 46 Z" fill="#c98a9a" opacity="0.7" />
            <circle cx="30" cy="22" r="2.5" fill="#e8c07a" />
            <path d="M12 50 L 48 50" strokeWidth="0.8" />
            <path d="M14 20 q -4 6 -2 12" />
            <path d="M46 20 q 4 6 2 12" />
          </g>
        </svg>
        <div style={{ fontSize: 8, letterSpacing: "0.2em" }}>POST</div>
      </div>
    </div>
  );
}

/** "OUR STORY" small ticket badge (bottom-left of card 4) */
function StoryTicket({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        width: 66,
        padding: "8px 6px",
        background:
          "repeating-linear-gradient(90deg, rgba(120,80,40,0.06) 0 2px, transparent 2px 5px), linear-gradient(180deg,#e8d1a8,#d5b280)",
        border: "1px solid rgba(90,60,25,0.35)",
        color: "#4a2f18",
        fontFamily: "'Special Elite', 'Courier New', monospace",
        fontSize: 9,
        letterSpacing: "0.18em",
        textAlign: "center",
        lineHeight: 1.2,
        boxShadow: "0 4px 8px -4px rgba(0,0,0,0.35)",
        // ticket notches
        WebkitMask:
          "radial-gradient(circle at 0 50%, transparent 4px, #000 4.5px), radial-gradient(circle at 100% 50%, transparent 4px, #000 4.5px)",
        WebkitMaskComposite: "source-in",
        ...style,
      }}
      aria-hidden
    >
      <div>OUR</div>
      <div>STORY</div>
      <svg viewBox="0 0 20 18" width="16" height="14" style={{ margin: "3px auto 0", display: "block" }}>
        <path d="M10 16 C 2 10, 0 5, 3 2 C 6 -1, 10 2, 10 5 C 10 2, 14 -1, 17 2 C 20 5, 18 10, 10 16 Z" fill="none" stroke="#6a4a2a" strokeWidth="1" />
      </svg>
    </div>
  );
}

/** Tape strip — direction & pattern configurable to match the reference variety */
function Tape({
  style,
  variant = "cream",
}: {
  style?: CSSProperties;
  variant?: "cream" | "pink" | "pink-stripe" | "brown" | "dots" | "kraft";
}) {
  const bg: Record<typeof variant, string> = {
    cream:
      "repeating-linear-gradient(90deg, rgba(180,140,90,0.12) 0 3px, transparent 3px 8px), linear-gradient(180deg, #ecd9b8, #d9c096)",
    pink:
      "repeating-linear-gradient(90deg, rgba(200,120,140,0.15) 0 3px, transparent 3px 8px), linear-gradient(180deg, #f2c9cf, #e6a8b3)",
    "pink-stripe":
      "repeating-linear-gradient(90deg, #e6a2ac 0 10px, #f5dde1 10px 20px)",
    brown:
      "repeating-linear-gradient(90deg, rgba(80,50,20,0.14) 0 3px, transparent 3px 8px), linear-gradient(180deg, #cba274, #a8825a)",
    dots:
      "radial-gradient(circle, #b88a5a 1.6px, transparent 2px) 0 0/8px 8px, linear-gradient(180deg,#efdcb8,#e2c88f)",
    kraft:
      "repeating-linear-gradient(90deg, rgba(80,50,20,0.05) 0 2px, transparent 2px 5px), linear-gradient(180deg,#d9b892,#c69a6b)",
  };
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        display: "block",
        background: bg[variant],
        opacity: 0.94,
        boxShadow:
          "0 4px 8px -4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(90,60,25,0.15)",
        ...style,
      }}
    />
  );
}

/* ============================================================
   Six distinct card templates — cycled by index
   ============================================================ */

type CardProps = {
  index: number;
  photoId: string;
  imageUrl: string;
  title?: string | null;
  date?: string | null;
  caption?: string | null;
  onOpen: () => void;
};

function PolaroidCard({ index, photoId, imageUrl, title, date, caption, onOpen }: CardProps) {

  // rotate through six layouts to match the reference sheet
  const variant = index % 6;
  // gentle per-index tilt so the collage feels handmade
  const tilts = [-2.4, 1.6, 2.4, -1.8, 1.2, -1.6];
  const rotate = tilts[variant];

  // photo aspect + inner padding vary per card (portrait vs landscape polaroids)
  const isPortrait = variant === 0;
  const ratio = isPortrait ? "3/4" : "4/3";

  return (
    <figure
      className="mb-16 break-inside-avoid inline-block w-full rise-2 relative"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="polaroid-ivory relative"
        style={{
          padding: "18px 18px 26px",
        }}
      >
        {/* ------------ per-variant embellishments ------------ */}
        {variant === 0 && (
          <>
            {/* pink diagonal tape top-left + brown horizontal tape bottom-left */}
            <Tape variant="pink" style={{ top: -10, left: 14, width: 92, height: 22, transform: "rotate(-14deg)" }} />
            <Tape variant="brown" style={{ bottom: -12, left: -18, width: 120, height: 22, transform: "rotate(-4deg)" }} />
          </>
        )}
        {variant === 1 && (
          <>
            {/* paperclip top-center + small ink heart bottom-right */}
            <Paperclip style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%) rotate(-6deg)", zIndex: 5 }} />
            <InkHeart style={{ position: "absolute", bottom: 8, right: 10, opacity: 0.75 }} />
          </>
        )}
        {variant === 2 && (
          <>
            {/* pink striped tape top-right + dried lavender sprig on the right */}
            <Tape variant="pink-stripe" style={{ top: -10, right: 20, width: 110, height: 22, transform: "rotate(6deg)" }} />
            <DriedSprig
              style={{ position: "absolute", right: -46, top: 40, transform: "rotate(14deg)" }}
              petal="#a08cc8"
              bud="#e8dcef"
            />
          </>
        )}
        {variant === 3 && (
          <>
            {/* striped diagonal tape top-left + OUR STORY ticket + baby's-breath sprig */}
            <Tape variant="pink-stripe" style={{ top: -8, left: -12, width: 90, height: 20, transform: "rotate(-32deg)" }} />
            <div style={{ position: "absolute", bottom: 14, left: 10, zIndex: 5 }}>
              <StoryTicket />
            </div>
            <DriedSprig
              style={{ position: "absolute", left: -44, top: 90, transform: "rotate(-16deg)" }}
              petal="#efe0c8"
              bud="#faf1de"
              stem="#8a7a5a"
            />
          </>
        )}
        {variant === 4 && (
          <>
            {/* polka-dot tape top-center + small kraft strip bottom-right + pink dried sprig */}
            <Tape variant="dots" style={{ top: -10, left: "42%", width: 100, height: 22, transform: "rotate(-2deg)" }} />
            <Tape variant="kraft" style={{ bottom: -10, right: 22, width: 70, height: 20, transform: "rotate(-6deg)" }} />
            <DriedSprig
              style={{ position: "absolute", right: -34, top: 120, transform: "rotate(18deg)" }}
              petal="#d68aa6"
              bud="#f2d6de"
            />
          </>
        )}
        {variant === 5 && (
          <>
            {/* LOVE POST postage stamp top-right + "Forever ♥" kraft strip bottom-right */}
            <div style={{ position: "absolute", top: 10, right: 10, transform: "rotate(4deg)", zIndex: 5 }}>
              <LovePostStamp />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -6,
                right: -8,
                padding: "6px 14px",
                background:
                  "repeating-linear-gradient(90deg, rgba(80,50,20,0.05) 0 2px, transparent 2px 5px), linear-gradient(180deg,#d9b892,#c69a6b)",
                boxShadow: "0 4px 8px -4px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(80,50,20,0.2)",
                clipPath: "polygon(3% 12%, 97% 4%, 100% 88%, 4% 96%)",
                transform: "rotate(-6deg)",
                color: "#4a2f18",
                fontFamily: "'Caveat', cursive",
                fontSize: 22,
                lineHeight: 1,
                zIndex: 5,
              }}
            >
              Forever <span style={{ color: "#8a3a48" }}>♥</span>
            </div>
          </>
        )}

        {/* ------------ photo well (image tucked into paper) ------------ */}
        <div className="relative">
          <button
            type="button"
            onClick={onOpen}
            className="photo-well block w-full overflow-hidden"
            style={{ aspectRatio: ratio }}
          >
            <img
              src={imageUrl}
              alt={title ?? ""}
              className="w-full h-full object-cover sepia-[0.12] brightness-95 saturate-[0.95] hover:scale-[1.04] transition duration-[900ms] ease-out"
            />
            {/* subtle inner vignette so the photo blends with the paper */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 55%, rgba(30,20,15,0.35) 100%)",
              }}
            />
          </button>
          <FavoriteButton
            photoId={photoId}
            className="absolute top-2 right-2 z-10"
          />

          {variant === 2 && <GoldCorners />}
        </div>


        {/* ------------ printed caption on the paper ------------ */}
        <figcaption className="pt-4 px-1 text-center relative">
          {title && (
            <h3
              className="serif italic text-[26px] leading-tight"
              style={{ color: "#5a3a1a" }}
            >
              {title}
            </h3>
          )}
          {date && (
            <p
              className="mt-1"
              style={{
                fontFamily: "'Special Elite', 'Courier New', monospace",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#7a5230",
              }}
            >
              {new Date(date).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          {caption && (
            <p
              className="serif italic mt-2 leading-snug"
              style={{ color: "#6a4a2a", fontSize: 17 }}
            >
              {caption}
            </p>
          )}
        </figcaption>
      </div>
    </figure>
  );
}

/* ============================================================
   Chapter view
   ============================================================ */

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
        <Link to="/album" className="hand text-lg text-[color:var(--pink-vivid)] hover:opacity-80">
          ← all chapters
        </Link>

        <header className="relative text-center my-12 rise-1">
          <Sprig className="hidden md:block absolute -left-4 -top-6 w-16 text-[color:var(--pink-vivid)]/45" />
          <Sprig flip className="hidden md:block absolute -right-4 -top-6 w-16 text-[color:var(--pink-vivid)]/45" />
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
          {(chapter as any).creator_name && (
            <p className="hand text-lg text-[color:var(--ink)]/55 mt-4 italic">
              written by {(chapter as any).creator_name}
            </p>
          )}
        </header>

        {chapter.song_url && (
          <div className="mb-12 aged-paper fold-crease rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 rise-2 relative overflow-hidden">
            <span className="washi-tape-gold" />
            <div className="flex items-center gap-2 shrink-0">
              <HeartIcon className="w-4 h-4 text-[color:var(--pink-vivid)] animate-[heartbeat_2.4s_ease-in-out_infinite]" />
              <span className="hand text-xl text-[color:var(--pink-vivid)]">a song for this chapter</span>
            </div>
            <audio controls src={chapter.song_url} className="flex-1 w-full" />
            <div className="hidden md:block absolute right-4 bottom-3">
              <Postmark city="Side A" label="Play me" />
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <p className="text-center text-muted-foreground italic">No photos in this chapter yet.</p>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-12 [column-fill:_balance]">
            {photos.map((p: any, i: number) => (
              <PolaroidCard
                key={p.id}
                photoId={p.id}
                index={i}
                imageUrl={p.image_url}
                title={p.title}
                date={p.taken_at}
                caption={p.caption}
                onOpen={() => setLightbox(i)}
              />
            ))}

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
