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

const TILTS = [-3.4, 2.6, -1.8, 3.1, -2.4, 1.9, -3.0, 2.2];

// Serpentine layout constants (SVG viewBox units)
const VB_W = 1200;
const CX = VB_W / 2;
const AMP = 220;          // how far the curve swings from center
const OFFSET = 260;       // extra distance from curve to polaroid pin
const ROW_H = 380;        // vertical spacing per entry
const TOP_PAD = 120;
const BOT_PAD = 160;

function Timeline() {
  const photos = Route.useLoaderData();
  const groups = groupByMonth(photos);

  // Flatten into a single sequence of entries, injecting month markers.
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

  // Compute anchor points on the S-curve for each node
  const anchors = useMemo(() => {
    return nodes.map((_, i) => {
      const y = TOP_PAD + i * ROW_H + ROW_H / 2;
      const side = i % 2 === 0 ? -1 : 1; // -1 left, +1 right
      const x = CX + side * AMP;
      return { x, y, side };
    });
  }, [nodes]);

  const totalH = TOP_PAD + nodes.length * ROW_H + BOT_PAD;

  // Build the flowing S-curve path via cubic Bézier segments through anchors.
  const pathD = useMemo(() => {
    if (anchors.length === 0) return "";
    let d = `M ${CX} 0`;
    let prev = { x: CX, y: 0 };
    for (const a of anchors) {
      const midY = (prev.y + a.y) / 2;
      d += ` C ${prev.x} ${midY}, ${a.x} ${midY}, ${a.x} ${a.y}`;
      prev = a;
    }
    // tail back to center at bottom
    const tailY = prev.y + ROW_H * 0.6;
    d += ` C ${prev.x} ${tailY}, ${CX} ${tailY}, ${CX} ${totalH}`;
    return d;
  }, [anchors, totalH]);

  // Draw-on-scroll for the main curve
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
      // progress: 0 when top hits mid-viewport, 1 when bottom hits mid-viewport
      const start = rect.top - vh * 0.55;
      const span = rect.height;
      const p = Math.min(1, Math.max(0, -start / span));
      path.style.strokeDashoffset = `${len * (1 - p)}`;

      // reveal polaroids as the line reaches their anchors
      const next = new Set<number>();
      for (let i = 0; i < anchors.length; i++) {
        const y = anchors[i].y / totalH;
        if (p >= y - 0.02) next.add(i);
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
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-14 rise-1">
          <p className="hand text-2xl text-[color:var(--rose-deep)]/80">
            everything, from the very start
          </p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2">Our Timeline</h1>
          <Flourish className="mt-6 mb-4" />
          <Link
            to="/album"
            className="hand text-lg text-[color:var(--rose-deep)] hover:opacity-80"
          >
            ← back to chapters
          </Link>
        </header>

        {nodes.length === 0 ? (
          <p className="text-center text-muted-foreground italic">No photos yet.</p>
        ) : (
          <>
            {/* Desktop / tablet: serpentine curve */}
            <div
              ref={scrollRef}
              className="relative hidden md:block"
              style={{ height: totalH * 0.62 /* scale factor visual */ }}
            >
              <svg
                aria-hidden
                viewBox={`0 0 ${VB_W} ${totalH}`}
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                {/* faint background curve so the drawn line rides on top */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="color-mix(in oklab, var(--gold) 35%, transparent)"
                  strokeWidth={1.2}
                  strokeDasharray="2 8"
                  vectorEffect="non-scaling-stroke"
                />
                {/* drawn curve */}
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
                {/* strings from curve to each polaroid pin */}
                {nodes.map((n, i) => {
                  if (n.kind !== "photo") return null;
                  const a = anchors[i];
                  const pinX = a.x + a.side * OFFSET;
                  const pinY = a.y + 40;
                  const show = visible.has(i);
                  return (
                    <g key={`s-${i}`} style={{ opacity: show ? 1 : 0, transition: "opacity 500ms ease" }}>
                      <path
                        d={`M ${a.x} ${a.y} Q ${(a.x + pinX) / 2} ${a.y + 4}, ${pinX} ${pinY}`}
                        fill="none"
                        stroke="color-mix(in oklab, var(--ink) 55%, transparent)"
                        strokeWidth={1.1}
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* knot at curve */}
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

              {/* Overlaid nodes positioned by % (matches SVG preserveAspectRatio="none") */}
              {nodes.map((n, i) => {
                const a = anchors[i];
                if (n.kind === "month") {
                  const leftPct = (CX / VB_W) * 100;
                  const topPct = (a.y / totalH) * 100;
                  return (
                    <div
                      key={n.key}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
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
                const tilt = TILTS[i % TILTS.length];
                const show = visible.has(i);
                const p = n.photo;
                return (
                  <article
                    key={n.key}
                    className="absolute -translate-x-1/2"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: "clamp(180px, 22vw, 260px)",
                      opacity: show ? 1 : 0,
                      transform: `translate(-50%, 0) rotate(${tilt}deg) translateY(${show ? 0 : 14}px)`,
                      transition: "opacity 600ms ease, transform 700ms cubic-bezier(.22,1,.36,1)",
                      transformOrigin: "top center",
                      animation: show ? "sway 6s ease-in-out infinite" : undefined,
                      animationDelay: `${(i % 4) * 0.4}s`,
                    }}
                  >
                    <div className="polaroid rounded-sm">
                      <img
                        src={p.image_url}
                        alt={p.title ?? ""}
                        className="w-full aspect-[4/3] object-cover"
                        loading="lazy"
                      />
                      <figcaption className="pt-2 pb-1 text-center">
                        {p.title && (
                          <h3 className="serif italic text-lg text-ink leading-tight">
                            {p.title}
                          </h3>
                        )}
                        {p.taken_at && (
                          <p className="hand text-sm text-[color:var(--ink)]/60">
                            {new Date(p.taken_at).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                        {p.chapters?.slug && (
                          <Link
                            to="/album/c/$slug"
                            params={{ slug: p.chapters.slug }}
                            className="text-[9px] uppercase tracking-[0.25em] text-[color:var(--rose-deep)]/80 mt-1 inline-block"
                          >
                            {p.chapters.title}
                          </Link>
                        )}
                      </figcaption>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Mobile fallback: simple stacked stream with a wavy accent */}
            <div className="md:hidden space-y-12">
              {groups.map((g) => (
                <section key={g.key}>
                  <div className="text-center mb-6">
                    <span className="inline-flex items-center gap-2 bg-[color:var(--letter-paper)] px-4 py-1 rounded-full border border-[color:var(--gold)]/40">
                      <HeartIcon className="w-3.5 h-3.5 text-[color:var(--rose-deep)]" />
                      <span className="serif italic text-xl text-[color:var(--rose-deep)]">
                        {g.label}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-10">
                    {g.items.map((p: any, i: number) => {
                      const tilt = TILTS[i % TILTS.length];
                      return (
                        <article key={p.id} className="mx-auto max-w-xs">
                          <div
                            className="polaroid rounded-sm"
                            style={{ transform: `rotate(${tilt}deg)` }}
                          >
                            <img
                              src={p.image_url}
                              alt={p.title ?? ""}
                              className="w-full aspect-[4/3] object-cover"
                              loading="lazy"
                            />
                            <figcaption className="pt-2 text-center">
                              {p.title && (
                                <h3 className="serif italic text-xl text-ink">{p.title}</h3>
                              )}
                              {p.caption && (
                                <p className="hand text-base text-[color:var(--ink)]/70 mt-1 px-2">
                                  {p.caption}
                                </p>
                              )}
                            </figcaption>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function groupByMonth(photos: any[]) {
  const map = new Map<string, { key: string; label: string; items: any[] }>();
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
