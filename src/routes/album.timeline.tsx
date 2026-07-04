import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { listTimeline } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";

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

function Timeline() {
  const photos = Route.useLoaderData();
  const groups = groupByMonth(photos);

  return (
    <div className="min-h-screen">
      <GateNav />
      <div className="max-w-3xl mx-auto px-6 py-14">
        <header className="text-center mb-12">
          <p className="hand text-2xl text-primary/80">everything, from the start</p>
          <h1 className="serif italic text-5xl md:text-6xl text-ink mt-2">Our Timeline</h1>
          <div className="gold-divider my-5 mx-auto w-32" />
          <Link to="/album" className="text-sm text-primary underline underline-offset-4">
            ← back to chapters
          </Link>
        </header>

        {groups.length === 0 ? (
          <p className="text-center text-muted-foreground">No photos yet.</p>
        ) : (
          <div className="space-y-14">
            {groups.map((g) => (
              <section key={g.key}>
                <h2 className="serif italic text-3xl text-primary/80 mb-6">{g.label}</h2>
                <div className="space-y-8">
                  {g.items.map((p: any) => (
                    <article key={p.id} className="paper rounded-2xl overflow-hidden">
                      <img src={p.image_url} alt={p.title ?? ""} className="w-full aspect-[4/3] object-cover" />
                      <div className="p-5">
                        {p.title && <h3 className="serif italic text-2xl text-ink">{p.title}</h3>}
                        {p.caption && <p className="text-muted-foreground text-sm mt-2">{p.caption}</p>}
                        {p.chapters?.slug && (
                          <Link to="/album/c/$slug" params={{ slug: p.chapters.slug }} className="text-xs text-primary underline underline-offset-4 mt-3 inline-block">
                            from “{p.chapters.title}”
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
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
    const label = d ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "Undated";
    if (!map.has(key)) map.set(key, { key, label, items: [] });
    map.get(key)!.items.push(p);
  }
  return [...map.values()];
}
