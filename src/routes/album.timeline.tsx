import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { listTimeline } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import { FloatingPetals, Flourish, HeartIcon } from "@/components/album/Ornaments";

export const Route = createFileRoute("/album/timeline")({
  loader: async () => {
    try {
      return await listTimeline();
    } catch {
      throw redirect({ to: "/" });
    }
  },
  component: Timeline,
});

const TILTS = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.2];

function Timeline() {
  const photos = Route.useLoaderData();
  const groups = groupByMonth(photos);

  return (
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
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
          <div className="relative">
            {/* center spine */}
            <div
              aria-hidden
              className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 hidden md:block"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, color-mix(in oklab, var(--gold) 70%, transparent) 0 6px, transparent 6px 14px)",
              }}
            />
            <div className="space-y-20">
              {groups.map((g, gi) => (
                <section key={g.key} className="relative">
                  <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-2 bg-background px-4 py-1 rounded-full border border-[color:var(--gold)]/40">
                      <HeartIcon className="w-3.5 h-3.5 text-[color:var(--rose-deep)]" />
                      <span className="serif italic text-xl text-[color:var(--rose-deep)]">
                        {g.label}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-14">
                    {g.items.map((p: any, i: number) => {
                      const side = (gi + i) % 2 === 0 ? "left" : "right";
                      const tilt = TILTS[(gi + i) % TILTS.length];
                      return (
                        <article
                          key={p.id}
                          className={`md:w-[46%] ${side === "right" ? "md:ml-auto" : ""}`}
                        >
                          <div
                            className="polaroid rounded-sm"
                            style={{ transform: `rotate(${tilt}deg)` }}
                          >
                            <span className="washi-tape" />
                            <img
                              src={p.image_url}
                              alt={p.title ?? ""}
                              className="w-full aspect-[4/3] object-cover"
                            />
                            <figcaption className="pt-3 text-center">
                              {p.title && (
                                <h3 className="serif italic text-2xl text-ink">{p.title}</h3>
                              )}
                              {p.caption && (
                                <p className="hand text-lg text-[color:var(--ink)]/70 mt-1 px-2">
                                  {p.caption}
                                </p>
                              )}
                              {p.chapters?.slug && (
                                <Link
                                  to="/album/c/$slug"
                                  params={{ slug: p.chapters.slug }}
                                  className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--rose-deep)]/80 mt-2 inline-block"
                                >
                                  from “{p.chapters.title}”
                                </Link>
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
          </div>
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
