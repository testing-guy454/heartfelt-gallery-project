import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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

// Deterministic pseudo-random so SSR and client render identically.
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x); // 0..1
}
const jitter = (i: number, spread: number) => (seeded(i) - 0.5) * spread * 2;

const TAPES = ["washi-tape", "washi-tape-gold"] as const;

function Timeline() {
  const photos = Route.useLoaderData();
  const groups = groupByMonth(photos);

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

        {groups.length === 0 ? (
          <p className="text-center text-muted-foreground italic">No photos yet.</p>
        ) : (
          <div className="space-y-20">
            {groups.map((g, gi) => (
              <MonthCluster key={g.key} group={g} gi={gi} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MonthCluster({ group, gi }: { group: { key: string; label: string; items: any[] }; gi: number }) {
  const bannerTilt = jitter(gi + 7, 2.5);
  return (
    <section className="relative">
      {/* torn paper banner header */}
      <div className="flex justify-center mb-10">
        <div
          className="relative inline-block px-8 py-2 bg-[color:var(--letter-paper)]"
          style={{
            transform: `rotate(${bannerTilt}deg)`,
            boxShadow:
              "0 10px 20px -14px rgba(0,0,0,0.35), 0 2px 0 rgba(0,0,0,0.05)",
            clipPath:
              "polygon(2% 12%, 8% 0, 22% 8%, 36% 2%, 52% 10%, 68% 0, 82% 8%, 96% 2%, 100% 18%, 98% 82%, 92% 98%, 78% 92%, 62% 100%, 46% 90%, 30% 98%, 16% 92%, 4% 100%, 0 84%)",
          }}
        >
          {/* washi tape on top */}
          <span
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 opacity-90"
            style={{
              background:
                "repeating-linear-gradient(45deg, color-mix(in oklab, var(--rose-deep) 55%, white) 0 6px, color-mix(in oklab, var(--rose-deep) 30%, white) 6px 12px)",
              transform: "rotate(-4deg)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
          <div className="flex items-center gap-3">
            <HeartIcon className="w-4 h-4 text-[color:var(--rose-deep)]" />
            <span className="serif italic text-3xl md:text-4xl text-[color:var(--rose-deep)] whitespace-nowrap">
              {group.label}
            </span>
            <HeartIcon className="w-4 h-4 text-[color:var(--rose-deep)]" />
          </div>
        </div>
      </div>

      {/* pinned collage grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-6 md:gap-x-8">
        {group.items.map((p: any, i: number) => {
          const seed = gi * 31 + i;
          const rot = jitter(seed, 6.5); // -6.5..6.5 deg
          const dx = jitter(seed + 1, 10); // px
          const dy = jitter(seed + 2, 14);
          const tape = TAPES[Math.floor(seeded(seed + 3) * TAPES.length)];
          const hasTape = seeded(seed + 4) > 0.35;
          const hasPin = !hasTape;
          const raise = seeded(seed + 5) > 0.5 ? 6 : 0;
          return (
            <article
              key={p.id}
              className="group relative"
              style={{
                transform: `translate(${dx}px, ${dy - raise}px) rotate(${rot}deg)`,
                transition: "transform 400ms cubic-bezier(.22,1,.36,1), z-index 0s",
              }}
            >
              <div
                className="polaroid rounded-sm relative group-hover:!scale-[1.06]"
                style={{
                  transformOrigin: "center top",
                  transition: "transform 400ms cubic-bezier(.22,1,.36,1), box-shadow 400ms ease",
                }}
              >
                {hasTape && (
                  <span
                    className={tape}
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
                <img
                  src={p.image_url}
                  alt={p.title ?? ""}
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
                <figcaption className="pt-2 pb-1 text-center">
                  {p.title && (
                    <h3 className="serif italic text-lg text-ink leading-tight">{p.title}</h3>
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
    </section>
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
