import { Link } from "@tanstack/react-router";
import type { MapChapter } from "@/lib/map.functions";

export function MemoryPreview({
  chapter,
  onClose,
  isMobile,
}: {
  chapter: MapChapter;
  onClose: () => void;
  isMobile: boolean;
}) {
  const dateLabel = formatDate(chapter.date_start, chapter.date_end);

  const card = (
    <div
      className="relative"
      style={{
        background: "#fbf4e6",
        backgroundImage:
          "radial-gradient(60px 40px at 92% 8%, rgba(120,80,40,0.18), transparent 70%), radial-gradient(40px 30px at 8% 96%, rgba(120,80,40,0.16), transparent 70%), linear-gradient(180deg, #fdf6e8, #f4e8d2)",
        boxShadow: "0 22px 44px -18px rgba(60,30,20,0.55), 0 4px 10px -6px rgba(80,50,30,0.4)",
        padding: "1rem 1rem 1.25rem",
        transform: isMobile ? "none" : "rotate(-1.2deg)",
        animation: "postcardLift 500ms cubic-bezier(.22,1,.36,1) both",
      }}
    >
      <span className="washi-tape" />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full text-[color:var(--sepia)] hover:text-[color:var(--rose-deep)] flex items-center justify-center bg-[color:var(--letter-paper)]/70 border border-[color:var(--sepia)]/30"
      >
        ✕
      </button>

      {chapter.cover_url && (
        <div className="mt-2 mb-3 aspect-[4/3] overflow-hidden bg-[#1a1310]" style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)" }}>
          <img
            src={chapter.cover_url}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "sepia(0.1) brightness(0.96)" }}
          />
        </div>
      )}

      <div className="hand text-lg text-[color:var(--pink-vivid)] leading-none mb-1">
        {chapter.location_name ?? "somewhere on the map"}
      </div>
      <h3 className="serif italic text-2xl text-ink leading-tight">{chapter.title}</h3>
      {dateLabel && (
        <p className="stamp-font text-[10px] uppercase tracking-[0.28em] text-[color:var(--sepia)] mt-1">
          {dateLabel}
        </p>
      )}
      {chapter.description && (
        <p className="hand text-lg text-[color:var(--ink)]/75 mt-3 leading-snug line-clamp-3">
          {chapter.description}
        </p>
      )}

      <Link
        to="/album/c/$slug"
        params={{ slug: chapter.slug }}
        className="mt-4 inline-flex items-center gap-2 stamp-font text-[11px] uppercase tracking-[0.25em] text-[color:var(--rose-deep)] hover:opacity-80"
      >
        ❤ Open this chapter →
      </Link>

      <style>{`
        @keyframes postcardLift {
          0%   { transform: translateY(12px) rotate(0deg) scale(0.96); opacity: 0; }
          100% { transform: ${isMobile ? "translateY(0)" : "rotate(-1.2deg)"}; opacity: 1; }
        }
      `}</style>
    </div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-[500] px-4 pb-4"
        style={{ animation: "slideUp 380ms cubic-bezier(.22,1,.36,1) both" }}
      >
        {card}
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div className="absolute top-6 right-6 z-[500] w-[320px]">
      {card}
    </div>
  );
}

function formatDate(a?: string | null, b?: string | null) {
  if (!a && !b) return null;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  return fmt((a || b)!);
}
