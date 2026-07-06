import { Link } from "@tanstack/react-router";
import { PhotoCorners } from "@/components/album/Ornaments";
import { isFavorite } from "@/lib/favorites";

export type WallPhoto = {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  taken_at: string | null;
  chapter_id: string | null;
  is_favorite?: boolean | null;
  chapters?: { title: string | null; slug: string | null } | null;
};

const TAPE_STYLES = [
  { className: "washi-tape", w: "6.5rem", angle: -6 },
  { className: "washi-tape-gold", w: "5.5rem", angle: 5 },
  { className: "washi-tape", w: "7rem", angle: 2 },
  { className: "washi-tape-gold", w: "6rem", angle: -3 },
];

export function PolaroidCard({
  photo,
  rotation,
  variant,
  onOpen,
  delayMs = 0,
}: {
  photo: WallPhoto;
  rotation: number;
  variant: number;
  onOpen: (p: WallPhoto) => void;
  delayMs?: number;
}) {
  const tape = TAPE_STYLES[variant % TAPE_STYLES.length];
  const isFav = photo.is_favorite || (typeof window !== "undefined" && isFavorite(photo.id));
  const dateLabel = photo.taken_at
    ? new Date(photo.taken_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : null;
  const caption = photo.title || photo.caption || photo.chapters?.title || "a memory";

  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      className="group relative block text-left focus:outline-none"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 320ms cubic-bezier(.22,1,.36,1), filter 320ms",
        transformOrigin: "50% 20%",
        animationDelay: `${delayMs}ms`,
      }}
      aria-label={`Open memory: ${caption}${dateLabel ? `, ${dateLabel}` : ""}`}
    >
      <span
        className="block polaroid rounded-[2px] transition-all duration-300 will-change-transform group-hover:-translate-y-2 group-hover:[transform:rotate(0deg)_translateY(-8px)] group-focus-visible:ring-2 group-focus-visible:ring-[color:var(--rose-deep)]"
        style={{
          width: "clamp(150px, 22vw, 220px)",
          boxShadow:
            "0 1px 0 rgba(0,0,0,0.06), 0 22px 42px -20px rgba(30,15,5,0.55), 0 6px 14px -8px rgba(30,15,5,0.35)",
        }}
      >
        {/* tape */}
        <span
          aria-hidden
          className={tape.className}
          style={{
            width: tape.w,
            top: "-0.75rem",
            transform: `translateX(-50%) rotate(${tape.angle}deg)`,
          }}
        />

        {/* photo */}
        <span className="relative block overflow-hidden bg-[color:var(--sepia)]/20">
          <img
            src={photo.image_url}
            alt={photo.title ?? "memory"}
            loading="lazy"
            decoding="async"
            className="block w-full aspect-square object-cover"
            style={{ filter: "saturate(0.92) contrast(0.97) sepia(0.06)" }}
          />
          <PhotoCorners />
          {isFav && (
            <span
              aria-label="favorite"
              className="absolute -top-1 -right-1 w-7 h-7 flex items-center justify-center pointer-events-none"
              style={{
                transform: "rotate(14deg)",
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
              }}
            >
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path
                  d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z"
                  fill="var(--pink-vivid)"
                  stroke="color-mix(in oklab, var(--rose-deep) 70%, black)"
                  strokeWidth="1.2"
                />
              </svg>
            </span>
          )}
        </span>

        {/* handwritten caption */}
        <span className="block pt-2 pb-1 px-1 text-center">
          <span className="hand text-[1.15rem] leading-tight text-[color:var(--ink)]/85 line-clamp-2 block">
            {caption}
          </span>
          {dateLabel && (
            <span className="stamp-font text-[9px] tracking-[0.28em] uppercase text-[color:var(--sepia)]/80 mt-1 block">
              {dateLabel}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
