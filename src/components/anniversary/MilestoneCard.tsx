import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { Milestone } from "@/lib/anniversary.functions";
import { PhotoCorners, Sprig, HeartIcon } from "@/components/album/Ornaments";

// Deterministic pseudo-random from string id — same milestone always looks the same
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(id: string, salt: number, arr: readonly T[]): T {
  return arr[hash(id + ":" + salt) % arr.length];
}

const TAPE_COLORS = [
  "color-mix(in oklab, var(--pink-vivid) 55%, transparent)",
  "color-mix(in oklab, var(--rose-deep) 45%, transparent)",
  "color-mix(in oklab, var(--gold) 45%, transparent)",
] as const;

const MOTIFS = ["ribbon", "petal", "sprig"] as const;

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function MilestoneCard({
  milestone,
  index,
  side,
}: {
  milestone: Milestone;
  index: number;
  side: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rotate = pick(milestone.id, 1, [-1.6, -1.1, 0.7, 1.4, -0.8, 1.9]);
  const tapeColor = pick(milestone.id, 2, TAPE_COLORS);
  const tapeAngle = pick(milestone.id, 3, [-8, -4, 3, 6, -12, 10]);
  const motif = pick(milestone.id, 4, MOTIFS);

  const alignClass =
    side === "left"
      ? "md:mr-auto md:ml-0 md:pr-8"
      : "md:ml-auto md:mr-0 md:pl-8";

  return (
    <article
      aria-labelledby={`ms-${milestone.id}-title`}
      className={`relative w-full md:w-[62%] ${alignClass}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="relative aged-paper stitched rounded-sm p-4 md:p-5"
        style={{ boxShadow: "0 24px 48px -28px rgba(80,40,30,0.55)" }}
      >
        {/* washi tape */}
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-[2px] opacity-90"
          style={{
            background: tapeColor,
            transform: `translateX(-50%) rotate(${tapeAngle}deg)`,
            boxShadow: "inset 0 0 12px rgba(255,255,255,0.25), 0 4px 8px -4px rgba(0,0,0,0.15)",
          }}
        />

        {milestone.emoji && (
          <div
            className="absolute -top-4 -left-3 w-11 h-11 rounded-full flex items-center justify-center text-2xl select-none"
            aria-hidden
            style={{
              background: "color-mix(in oklab, var(--letter-paper) 92%, transparent)",
              border: "1px solid color-mix(in oklab, var(--sepia) 40%, transparent)",
              boxShadow: "0 6px 14px -8px rgba(80,40,30,0.5)",
              transform: `rotate(${-rotate * 2}deg)`,
            }}
          >
            {milestone.emoji}
          </div>
        )}

        {/* Cover */}
        {milestone.cover_url && (
          <div className="relative mb-4 rounded-sm overflow-hidden bg-black/5">
            <img
              src={milestone.cover_url}
              alt={milestone.title}
              className="w-full h-64 md:h-72 object-cover sepia-[0.08] brightness-95"
              loading="lazy"
            />
            <PhotoCorners />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(30,20,15,0.28)_100%)]" />
          </div>
        )}

        {/* Header */}
        <header className="relative">
          {motif === "sprig" && (
            <Sprig className="absolute -top-2 right-1 w-8 text-[color:var(--pink-vivid)]/35" />
          )}
          <p className="stamp-font text-[0.58rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase">
            {formatDate(milestone.date)}
            {milestone.location_name ? ` · ${milestone.location_name}` : ""}
          </p>
          <h3
            id={`ms-${milestone.id}-title`}
            className="serif italic text-3xl md:text-4xl text-ink mt-1 leading-tight"
          >
            {milestone.title}
          </h3>
          {milestone.handwritten_note && (
            <p className="hand text-xl text-[color:var(--pink-vivid)] mt-2 leading-snug">
              {milestone.handwritten_note}
            </p>
          )}
        </header>

        {/* Story */}
        {milestone.description && (
          <div className="mt-3">
            <p
              className={`serif text-[15px] md:text-base text-ink/85 leading-relaxed ${
                open ? "" : "line-clamp-4"
              }`}
            >
              {milestone.description}
            </p>
            {milestone.description.length > 220 && (
              <button
                onClick={() => setOpen((v) => !v)}
                className="mt-2 stamp-font text-[10px] tracking-[0.3em] uppercase text-[color:var(--rose-deep)] hover:text-[color:var(--pink-vivid)] transition"
              >
                {open ? "less ←" : "read more →"}
              </button>
            )}
          </div>
        )}

        {/* Music */}
        {milestone.music_url && (
          <audio
            controls
            preload="none"
            src={milestone.music_url}
            className="mt-3 w-full h-8"
          />
        )}

        {/* Gallery */}
        {milestone.gallery_urls.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {milestone.gallery_urls.slice(0, 6).map((u, i) => (
              <img
                key={u + i}
                src={u}
                alt=""
                aria-hidden
                loading="lazy"
                className="w-full aspect-square object-cover rounded-sm sepia-[0.1]"
                style={{ transform: `rotate(${((i % 3) - 1) * 1.2}deg)` }}
              />
            ))}
          </div>
        )}

        {/* Related chapter */}
        {milestone.chapter_slug && milestone.chapter_title && (
          <div className="mt-5 pt-4 border-t border-[color:var(--sepia)]/25">
            <p className="stamp-font text-[9px] tracking-[0.42em] uppercase text-[color:var(--sepia)]/75">
              related memory
            </p>
            <Link
              to="/album/c/$slug"
              params={{ slug: milestone.chapter_slug }}
              className="inline-flex items-center gap-2 mt-1 serif italic text-lg text-[color:var(--rose-deep)] hover:text-[color:var(--pink-vivid)] transition"
            >
              <HeartIcon className="w-4 h-4" />
              {milestone.chapter_title}
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>

      {/* Index badge (subtle handwritten number) */}
      <div
        aria-hidden
        className="hand text-lg text-[color:var(--sepia)]/70 mt-2"
        style={{ transform: `rotate(${-rotate}deg)` }}
      >
        · chapter {String(index + 1).padStart(2, "0")} ·
      </div>
    </article>
  );
}
