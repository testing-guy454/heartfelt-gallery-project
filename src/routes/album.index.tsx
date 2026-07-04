import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { listChapters } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import { FloatingPetals, Flourish, HeartIcon, Sprig } from "@/components/album/Ornaments";

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
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <header className="text-center mb-16 rise-1">
          <p className="hand text-2xl text-[color:var(--rose-deep)]/80">a little something for you</p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2">Our Chapters</h1>
          <Flourish className="mt-6 mb-4" />
          <p className="text-muted-foreground max-w-lg mx-auto italic leading-relaxed">
            Every chapter is a small piece of us. Take your time —
            it isn't going anywhere.
          </p>
          <div className="mt-6">
            <Link
              to="/album/timeline"
              className="inline-flex items-center gap-2 text-sm hand text-lg text-[color:var(--rose-deep)] hover:opacity-80 transition"
            >
              or wander the whole timeline →
            </Link>
          </div>
        </header>

        {chapters.length === 0 ? (
          <p className="text-center text-muted-foreground italic">No chapters yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {chapters.map((c: any, i: number) => (
              <Link
                key={c.id}
                to="/album/c/$slug"
                params={{ slug: c.slug }}
                className={`group paper-deep rounded-2xl overflow-hidden block hover:-translate-y-1.5 transition duration-500 relative rise-${Math.min(i + 2, 5)}`}
              >
                {/* Chapter number */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="serif italic text-sm text-[color:var(--gold)] bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-[color:var(--gold)]/30">
                    Chapter {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                  {c.cover_url && (
                    <img
                      src={c.cover_url}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-[1200ms] ease-out"
                    />
                  )}
                  {/* soft warm overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--rose-deep)]/25 via-transparent to-transparent" />
                  {(c.date_start || c.date_end) && (
                    <div className="absolute bottom-4 left-4">
                      <span className="ribbon">{formatRange(c.date_start, c.date_end)}</span>
                    </div>
                  )}
                </div>

                <div className="p-7 relative">
                  <Sprig className="absolute -top-8 right-4 w-10 text-[color:var(--rose-deep)]/25 opacity-0 group-hover:opacity-100 transition duration-700" />
                  <h2 className="serif italic text-3xl md:text-4xl text-ink group-hover:text-[color:var(--rose-deep)] transition">
                    {c.title}
                  </h2>
                  {c.description && (
                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed italic">
                      {c.description}
                    </p>
                  )}
                  <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[color:var(--rose-deep)]/80">
                    <HeartIcon className="w-3 h-3" />
                    open this chapter
                  </div>
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
