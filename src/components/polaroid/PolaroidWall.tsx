import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PolaroidCard, type WallPhoto } from "./PolaroidCard";
import { Corkboard } from "./Corkboard";
import { DecorativeOverlay } from "./DecorativeOverlay";
import { WallFilters } from "./WallFilters";
import { WallSearch } from "./WallSearch";
import { getFavoriteIds } from "@/lib/favorites";

/** deterministic pseudo-random 0..1 from a string */
function hash01(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

type Placed = {
  photo: WallPhoto;
  x: number;
  y: number;
  rotation: number;
  variant: number;
};

const ROW_H = 260;
const CARD_W = 200;

function layout(photos: WallPhoto[], containerWidth: number): { items: Placed[]; height: number } {
  const cols = Math.max(2, Math.min(6, Math.floor(containerWidth / (CARD_W + 20))));
  const gapX = (containerWidth - cols * CARD_W) / (cols + 1);
  const items: Placed[] = photos.map((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (hash01(p.id, 1) - 0.5) * (gapX * 0.9);
    const jitterY = (hash01(p.id, 2) - 0.5) * 60;
    const rotation = (hash01(p.id, 3) - 0.5) * 10; // -5..+5
    const variant = Math.floor(hash01(p.id, 4) * 4);
    const x = gapX + col * (CARD_W + gapX) + jitterX;
    const y = 40 + row * ROW_H + jitterY + (col % 2 === 0 ? 0 : 30);
    return { photo: p, x, y, rotation, variant };
  });
  const rows = Math.ceil(photos.length / cols);
  const height = 80 + rows * ROW_H + 80;
  return { items, height };
}

export function PolaroidWall({ photos }: { photos: WallPhoto[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1000);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [arrangement, setArrangement] = useState<"wall" | "chrono">("wall");
  const [open, setOpen] = useState<WallPhoto | null>(null);
  const [favVersion, setFavVersion] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // gather filter labels from chapter titles
  const labels = useMemo(() => {
    const titles = new Set<string>();
    for (const p of photos) if (p.chapters?.title) titles.add(p.chapters.title);
    return ["All", "Favorites", ...Array.from(titles).sort()];
  }, [photos]);

  const filtered = useMemo(() => {
    const favIds = typeof window !== "undefined" ? new Set(getFavoriteIds()) : new Set<string>();
    void favVersion;
    let list = photos.slice();
    if (filter === "Favorites") {
      list = list.filter((p) => p.is_favorite || favIds.has(p.id));
    } else if (filter !== "All") {
      list = list.filter((p) => p.chapters?.title === filter);
    }
    if (arrangement === "chrono") {
      list.sort((a, b) => {
        const ta = a.taken_at ? new Date(a.taken_at).getTime() : 0;
        const tb = b.taken_at ? new Date(b.taken_at).getTime() : 0;
        return ta - tb;
      });
    } else {
      // deterministic shuffle by id hash
      list.sort((a, b) => hash01(a.id, 9) - hash01(b.id, 9));
    }
    return list;
  }, [photos, filter, arrangement, favVersion]);

  const { items, height } = useMemo(() => layout(filtered, width), [filtered, width]);

  const q = query.trim().toLowerCase();
  function matches(p: WallPhoto): boolean {
    if (!q) return true;
    return [p.title, p.caption, p.chapters?.title, p.taken_at]
      .filter(Boolean)
      .some((s) => String(s).toLowerCase().includes(q));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
        <WallSearch value={query} onChange={setQuery} />
        <div className="flex-1">
          <WallFilters
            labels={labels}
            active={filter}
            onSelect={setFilter}
            arrangement={arrangement}
            onArrangementChange={setArrangement}
          />
        </div>
      </div>

      <Corkboard>
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ minHeight: height, height }}
        >
          <DecorativeOverlay width={width} height={height} />
          {items.map((it, i) => {
            const dim = q && !matches(it.photo);
            return (
              <div
                key={it.photo.id}
                className="absolute wall-item"
                style={
                  {
                    left: it.x,
                    top: it.y,
                    width: CARD_W,
                    // Framing offset for hover lift
                    "--r": `${it.rotation}deg`,
                    animationDelay: `${Math.min(i * 55, 1400)}ms`,
                    opacity: dim ? 0.22 : 1,
                    filter: dim ? "grayscale(0.5)" : "none",
                    transition: "opacity 300ms, filter 300ms",
                    zIndex: dim ? 1 : 2 + (i % 5),
                  } as React.CSSProperties
                }
              >
                <PolaroidCard
                  photo={it.photo}
                  rotation={it.rotation}
                  variant={it.variant}
                  onOpen={setOpen}
                  delayMs={Math.min(i * 55, 1400)}
                />
              </div>
            );
          })}
        </div>
      </Corkboard>

      {open && (
        <Lightbox
          photo={open}
          onClose={() => {
            setOpen(null);
            setFavVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

function Lightbox({ photo, onClose }: { photo: WallPhoto; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style={{
        background: "rgba(30,15,5,0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.title ?? "Memory"}
    >
      <div
        className="polaroid rounded-[2px] max-w-[min(92vw,560px)] animate-scale-in"
        style={{ transform: "rotate(-1.5deg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="washi-tape" style={{ width: "8rem" }} />
        <img
          src={photo.image_url}
          alt={photo.title ?? "memory"}
          className="w-full max-h-[72vh] object-contain bg-black/70"
        />
        <div className="pt-4 pb-2 text-center px-3">
          <div className="hand text-2xl text-[color:var(--ink)]/85">
            {photo.title || photo.caption || photo.chapters?.title || "a memory"}
          </div>
          {photo.taken_at && (
            <div className="stamp-font text-[10px] tracking-[0.3em] uppercase text-[color:var(--sepia)]/80 mt-1">
              {new Date(photo.taken_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}
          {photo.chapters?.slug && (
            <Link
              to="/album/c/$slug"
              params={{ slug: photo.chapters.slug }}
              className="serif italic text-[color:var(--rose-deep)] mt-3 inline-block hover:underline"
              onClick={onClose}
            >
              open the full chapter →
            </Link>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[color:var(--letter-paper)]/90 text-[color:var(--ink)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        ✕
      </button>
    </div>
  );
}
