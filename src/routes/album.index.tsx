import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { listChapters } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";

export const Route = createFileRoute("/album/")({
  loader: async () => {
    try {
      return await listChapters();
    } catch {
      throw redirect({ to: "/unlock" });
    }
  },
  component: AlbumHome,
});

function AlbumHome() {
  const chapters = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <GateNav />
      <div className="max-w-5xl mx-auto px-6 py-14">
        <header className="text-center mb-14">
          <p className="hand text-2xl text-primary/80">a little something for you</p>
          <h1 className="serif italic text-5xl md:text-6xl text-ink mt-2">Our Chapters</h1>
          <div className="gold-divider my-5 mx-auto w-32" />
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every chapter is a small piece of us. Take your time — it isn't going anywhere.
          </p>
          <div className="mt-6">
            <Link to="/album/timeline" className="text-sm text-primary underline underline-offset-4">
              or browse everything on a timeline →
            </Link>
          </div>
        </header>

        {chapters.length === 0 ? (
          <p className="text-center text-muted-foreground">No chapters yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {chapters.map((c: any) => (
              <Link
                key={c.id}
                to="/album/c/$slug"
                params={{ slug: c.slug }}
                className="group paper rounded-2xl overflow-hidden block hover:-translate-y-1 transition"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {c.cover_url && (
                    <img
                      src={c.cover_url}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="serif italic text-3xl text-ink">{c.title}</h2>
                  {(c.date_start || c.date_end) && (
                    <p className="hand text-lg text-primary/70 mt-1">
                      {formatRange(c.date_start, c.date_end)}
                    </p>
                  )}
                  {c.description && (
                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{c.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatRange(a?: string | null, b?: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  return fmt(a || b!);
}
