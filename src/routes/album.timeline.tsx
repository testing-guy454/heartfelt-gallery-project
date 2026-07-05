import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { listTimeline } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import { FloatingPetals, Flourish, HeartIcon } from "@/components/album/Ornaments";

export const Route = createFileRoute("/album/timeline")({
  loader: async () => {
    try {
      return await listTimeline();
    } catch {
      throw redirect({ to: "/unlock" });
    }
  },
  component: Timeline,
});

type Style = "vertical" | "scrapbook" | "serpentine";
const STYLE_KEY = "album.timeline.style";

// Deterministic pseudo-random so SSR and client render identically.
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
const jitter = (i: number, spread: number) => (seeded(i) - 0.5) * spread * 2;

function Timeline() {
  const photos = Route.useLoaderData();
  const groups = useMemo(() => groupByMonth(photos), [photos]);
  const [style, setStyle] = useState<Style>("vertical");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STYLE_KEY) as Style | null;
      if (saved === "vertical" || saved === "scrapbook" || saved === "serpentine") {
        setStyle(saved);
      }
    } catch {}
  }, []);

  const choose = (s: Style) => {
    setStyle(s);
    try {
      localStorage.setItem(STYLE_KEY, s);
    } catch {}
  };

  return (
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <header className="text-center mb-8 rise-1">
          <p className="hand text-xl sm:text-2xl text-[color:var(--rose-deep)]/80">
            everything, from the very start
          </p>
          <h1 className="serif italic text-4xl sm:text-5xl md:text-7xl text-ink mt-2">
            Our Timeline
          </h1>
          <Flourish className="mt-5 mb-3" />
          <Link
            to="/album"
            className="hand text-base sm:text-lg text-[color:var(--rose-deep)] hover:opacity-80"
          >
            ← back to chapters
          </Link>
        </header>

        <StyleSelector value={style} onChange={choose} />

        {groups.length === 0 ? (
          <p className="text-center text-muted-foreground italic mt-16">No photos yet.</p>
        ) : (
          <div className="mt-10">
            {style === "vertical" && <VerticalTimeline groups={groups} />}
            {style === "scrapbook" && <ScrapbookTimeline groups={groups} />}
            {style === "serpentine" && <SerpentineTimeline groups={groups} />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── Style selector */

function StyleSelector({ value, onChange }: { value: Style; onChange: (s: Style) => void }) {
  const opts: { id: Style; label: string }[] = [
    { id: "vertical", label: "Clean" },
    { id: "scrapbook", label: "Scrapbook" },
    { id: "serpentine", label: "Serpentine" },
  ];
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex items-center gap-1 p-1 rounded-full border border-[color:var(--gold)]/50 bg-[color:var(--letter-paper)]/85 backdrop-blur-sm shadow-sm"
        role="tablist"
        aria-label="Timeline style"
      >
        {opts.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.id)}
              className={
                "px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-full transition-colors tracking-wide uppercase " +
                (active
                  ? "bg-[color:var(--rose-deep)] text-[color:var(--letter-paper)] shadow-sm"
                  : "text-[color:var(--ink)]/70 hover:text-[color:var(--rose-deep)]")
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── Clean vertical */

type Group = { key: string; label: string; items: any[] };

function VerticalTimeline({ groups }: { groups: Group[] }) {
  const flat = useMemo(() => {
    const out: { group: Group; photo: any; firstOfGroup: boolean }[] = [];
    for (const g of groups) {
      g.items.forEach((p, i) => out.push({ group: g, photo: p, firstOfGroup: i === 0 }));
    }
    return out;
  }, [groups]);

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Desktop / tablet: month | line | card */}
      <div className="hidden md:block relative">
        {/* central curved dashed spine */}
        <svg
          aria-hidden
          className="absolute left-[22%] top-0 h-full pointer-events-none"
          width="60"
          viewBox="0 0 60 1000"
          preserveAspectRatio="none"
        >
          <path
            d="M 30 0 C 10 250, 50 500, 30 750 S 10 1000, 30 1000"
            fill="none"
            stroke="color-mix(in oklab, var(--rose-deep) 55%, var(--gold))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <ul className="space-y-14">
          {flat.map((entry, i) => (
            <li key={entry.photo.id} className="grid grid-cols-[22%_1fr] items-start gap-6">
              <div className="pt-6 text-right pr-6 relative">
                {entry.firstOfGroup && (
                  <div className="hand text-2xl text-[color:var(--rose-deep)] leading-tight">
                    {entry.group.label}
                  </div>
                )}
                {entry.photo.taken_at && (
                  <div className="serif italic text-sm text-[color:var(--ink)]/60 mt-1">
                    {new Date(entry.photo.taken_at).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                )}
              </div>
              <div className="relative pl-6">
                {/* node dot on the spine */}
                <span
                  aria-hidden
                  className="absolute -left-[6px] top-8 w-3 h-3 rounded-full bg-[color:var(--rose-deep)] ring-2 ring-[color:var(--letter-paper)]"
                />
                <PhotoCard photo={entry.photo} tilt={jitter(i + 3, 1.5)} compact />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile: stacked with a thin left rail */}
      <div className="md:hidden relative pl-6">
        <span
          aria-hidden
          className="absolute left-2 top-2 bottom-2 w-px"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, color-mix(in oklab, var(--rose-deep) 55%, var(--gold)) 0 4px, transparent 4px 10px)",
          }}
        />
        <ul className="space-y-10">
          {flat.map((entry, i) => (
            <li key={entry.photo.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[18px] top-3 w-2.5 h-2.5 rounded-full bg-[color:var(--rose-deep)] ring-2 ring-[color:var(--letter-paper)]"
              />
              {entry.firstOfGroup && (
                <div className="hand text-xl text-[color:var(--rose-deep)] mb-2">
                  {entry.group.label}
                </div>
              )}
              <PhotoCard photo={entry.photo} tilt={jitter(i + 3, 1.2)} compact />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── Scrapbook (previous style) */

function ScrapbookTimeline({ groups }: { groups: Group[] }) {
  return (
    <div className="space-y-16 md:space-y-20">
      {groups.map((g, gi) => (
        <section key={g.key} className="relative">
          <MonthBanner label={g.label} tilt={jitter(gi + 7, 2.5)} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 sm:gap-y-10 gap-x-4 sm:gap-x-6 md:gap-x-8">
            {g.items.map((p: any, i: number) => {
              const seed = gi * 31 + i;
              const rot = jitter(seed, 6);
              const dx = jitter(seed + 1, 6);
              const dy = jitter(seed + 2, 10);
              const hasPin = seeded(seed + 4) < 0.45;
              return (
                <article
                  key={p.id}
                  className="relative"
                  style={{
                    transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
                  }}
                >
                  <div className="polaroid rounded-sm relative">
                    {!hasPin && (
                      <span
                        className="washi-tape"
                        style={{
                          transform: `translateX(-50%) rotate(${jitter(seed + 6, 8)}deg)`,
                        }}
                      />
                    )}
                    {hasPin && (
                      <span
                        aria-hidden
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 30%, #ffb0b0, var(--rose-deep) 65%, #6a1f1f)",
                          boxShadow:
                            "0 2px 3px rgba(0,0,0,0.35), inset -1px -1px 2px rgba(0,0,0,0.25)",
                        }}
                      />
                    )}
                    <PhotoBody photo={p} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function MonthBanner({ label, tilt }: { label: string; tilt: number }) {
  return (
    <div className="flex justify-center mb-8 md:mb-10">
      <div
        className="relative inline-block px-6 sm:px-8 py-2 bg-[color:var(--letter-paper)]"
        style={{
          transform: `rotate(${tilt}deg)`,
          boxShadow: "0 10px 20px -14px rgba(0,0,0,0.35), 0 2px 0 rgba(0,0,0,0.05)",
          clipPath:
            "polygon(2% 12%, 8% 0, 22% 8%, 36% 2%, 52% 10%, 68% 0, 82% 8%, 96% 2%, 100% 18%, 98% 82%, 92% 98%, 78% 92%, 62% 100%, 46% 90%, 30% 98%, 16% 92%, 4% 100%, 0 84%)",
        }}
      >
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4 opacity-90"
          style={{
            background:
              "repeating-linear-gradient(45deg, color-mix(in oklab, var(--rose-deep) 55%, white) 0 6px, color-mix(in oklab, var(--rose-deep) 30%, white) 6px 12px)",
            transform: "rotate(-4deg)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}
        />
        <div className="flex items-center gap-3">
          <HeartIcon className="w-4 h-4 text-[color:var(--rose-deep)]" />
          <span className="serif italic text-2xl sm:text-3xl md:text-4xl text-[color:var(--rose-deep)] whitespace-nowrap">
            {label}
          </span>
          <HeartIcon className="w-4 h-4 text-[color:var(--rose-deep)]" />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── Serpentine (S-curve) */

const VB_W = 1200;
const CX = VB_W / 2;
const AMP = 220;
const OFFSET = 260;
const ROW_H = 380;
const TOP_PAD = 120;
const BOT_PAD = 160;

function SerpentineTimeline({ groups }: { groups: Group[] }) {
  type Node =
    | { kind: "month"; key: string; label: string }
    | { kind: "photo"; key: string; photo: any };
  const nodes = useMemo<Node[]>(() => {
    const out: Node[] = [];
    for (const g of groups) {
      out.push({ kind: "month", key: `m-${g.key}`, label: g.label });
      for (const p of g.items) out.push({ kind: "photo", key: `p-${p.id}`, photo: p });
    }
    return out;
  }, [groups]);

  const anchors = useMemo(
    () =>
      nodes.map((_, i) => {
        const y = TOP_PAD + i * ROW_H + ROW_H / 2;
        const side = i % 2 === 0 ? -1 : 1;
        return { x: CX + side * AMP, y, side };
      }),
    [nodes],
  );
  const totalH = TOP_PAD + nodes.length * ROW_H + BOT_PAD;
  const pathD = useMemo(() => {
    if (anchors.length === 0) return "";
    let d = `M ${CX} 0`;
    let prev = { x: CX, y: 0 };
    for (const a of anchors) {
      const midY = (prev.y + a.y) / 2;
      d += ` C ${prev.x} ${midY}, ${a.x} ${midY}, ${a.x} ${a.y}`;
      prev = a;
    }
    d += ` C ${prev.x} ${prev.y + ROW_H * 0.6}, ${CX} ${prev.y + ROW_H * 0.6}, ${CX} ${totalH}`;
    return d;
  }, [anchors, totalH]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [visible, setVisible] = useState<Set<number>>(new Set());

  useEffect(() => {
    const el = scrollRef.current;
    const path = pathRef.current;
    if (!el || !path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = rect.top - vh * 0.55;
      const p = Math.min(1, Math.max(0, -start / rect.height));
      path.style.strokeDashoffset = `${len * (1 - p)}`;
      const next = new Set<number>();
      for (let i = 0; i < anchors.length; i++) {
        if (p >= anchors[i].y / totalH - 0.02) next.add(i);
      }
      setVisible((prev) => (prev.size === next.size ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [anchors, totalH, pathD]);

  return (
    <>
      {/* Desktop */}
      <div
        ref={scrollRef}
        className="relative hidden md:block"
        style={{ height: totalH * 0.62 }}
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${VB_W} ${totalH}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path
            d={pathD}
            fill="none"
            stroke="color-mix(in oklab, var(--gold) 35%, transparent)"
            strokeWidth={1.2}
            strokeDasharray="2 8"
            vectorEffect="non-scaling-stroke"
          />
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="color-mix(in oklab, var(--rose-deep) 70%, var(--gold))"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
          {nodes.map((n, i) => {
            if (n.kind !== "photo") return null;
            const a = anchors[i];
            const pinX = a.x + a.side * OFFSET;
            const pinY = a.y + 40;
            const show = visible.has(i);
            return (
              <g
                key={`s-${i}`}
                style={{ opacity: show ? 1 : 0, transition: "opacity 500ms ease" }}
              >
                <path
                  d={`M ${a.x} ${a.y} Q ${(a.x + pinX) / 2} ${a.y + 4}, ${pinX} ${pinY}`}
                  fill="none"
                  stroke="color-mix(in oklab, var(--ink) 55%, transparent)"
                  strokeWidth={1.1}
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={a.x}
                  cy={a.y}
                  r={5}
                  fill="var(--rose-deep)"
                  stroke="var(--letter-paper)"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        {nodes.map((n, i) => {
          const a = anchors[i];
          if (n.kind === "month") {
            return (
              <div
                key={n.key}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: "50%", top: `${(a.y / totalH) * 100}%` }}
              >
                <span className="inline-flex items-center gap-2 bg-[color:var(--letter-paper)] px-4 py-1 rounded-full border border-[color:var(--gold)]/50 shadow-sm">
                  <HeartIcon className="w-3.5 h-3.5 text-[color:var(--rose-deep)]" />
                  <span className="serif italic text-xl text-[color:var(--rose-deep)] whitespace-nowrap">
                    {n.label}
                  </span>
                </span>
              </div>
            );
          }
          const pinX = a.x + a.side * OFFSET;
          const pinY = a.y + 40;
          const leftPct = (pinX / VB_W) * 100;
          const topPct = (pinY / totalH) * 100;
          const show = visible.has(i);
          return (
            <article
              key={n.key}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: "clamp(180px, 22vw, 260px)",
                opacity: show ? 1 : 0,
                transform: `translate(-50%, 0) rotate(${jitter(i, 3)}deg) translateY(${
                  show ? 0 : 14
                }px)`,
                transition:
                  "opacity 600ms ease, transform 700ms cubic-bezier(.22,1,.36,1)",
                transformOrigin: "top center",
                animation: show ? "sway 6s ease-in-out infinite" : undefined,
                animationDelay: `${(i % 4) * 0.4}s`,
              }}
            >
              <div className="polaroid rounded-sm">
                <PhotoBody photo={n.photo} compact />
              </div>
            </article>
          );
        })}
      </div>

      {/* Mobile fallback: stacked with subtle wave rail */}
      <div className="md:hidden space-y-10">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="text-center mb-5">
              <span className="inline-flex items-center gap-2 bg-[color:var(--letter-paper)] px-4 py-1 rounded-full border border-[color:var(--gold)]/40">
                <HeartIcon className="w-3.5 h-3.5 text-[color:var(--rose-deep)]" />
                <span className="serif italic text-xl text-[color:var(--rose-deep)]">
                  {g.label}
                </span>
              </span>
            </div>
            <div className="space-y-8">
              {g.items.map((p: any, i: number) => (
                <article key={p.id} className="mx-auto max-w-[260px]">
                  <div
                    className="polaroid rounded-sm"
                    style={{ transform: `rotate(${jitter(i + 1, 2)}deg)` }}
                  >
                    <PhotoBody photo={p} compact />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────── Shared photo card bits */

function PhotoCard({ photo, tilt, compact }: { photo: any; tilt: number; compact?: boolean }) {
  return (
    <div
      className="polaroid rounded-sm mx-auto"
      style={{
        transform: `rotate(${tilt}deg)`,
        maxWidth: compact ? "clamp(220px, 32vw, 320px)" : undefined,
      }}
    >
      <PhotoBody photo={photo} compact={compact} />
    </div>
  );
}

function PhotoBody({ photo, compact }: { photo: any; compact?: boolean }) {
  return (
    <>
      <img
        src={photo.image_url}
        alt={photo.title ?? ""}
        className="w-full aspect-[4/3] object-cover"
        loading="lazy"
      />
      <figcaption className="pt-2 pb-1 text-center">
        {photo.title && (
          <h3
            className={
              (compact ? "text-base sm:text-lg " : "text-lg sm:text-xl ") +
              "serif italic text-ink leading-tight"
            }
          >
            {photo.title}
          </h3>
        )}
        {photo.caption && !compact && (
          <p className="hand text-sm sm:text-base text-[color:var(--ink)]/70 mt-1 px-2">
            {photo.caption}
          </p>
        )}
        {photo.taken_at && (
          <p className="hand text-xs sm:text-sm text-[color:var(--ink)]/60">
            {new Date(photo.taken_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
        {photo.chapters?.slug && (
          <Link
            to="/album/c/$slug"
            params={{ slug: photo.chapters.slug }}
            className="text-[9px] uppercase tracking-[0.25em] text-[color:var(--rose-deep)]/80 mt-1 inline-block"
          >
            {photo.chapters.title}
          </Link>
        )}
      </figcaption>
    </>
  );
}

function groupByMonth(photos: any[]): Group[] {
  const map = new Map<string, Group>();
  for (const p of photos) {
    const d = p.taken_at ? new Date(p.taken_at) : null;
    const key = d ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}` : "undated";
    const label = d
      ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : "Undated";
    if (!map.has(key)) map.set(key, { key, label, items: [] });
    map.get(key)!.items.push(p);
  }
  return [...map.values()];
}
