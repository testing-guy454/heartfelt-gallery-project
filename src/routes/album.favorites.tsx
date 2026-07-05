import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { listFavorites } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import { FloatingPetals, Flourish, HeartIcon } from "@/components/album/Ornaments";

export const Route = createFileRoute("/album/favorites")({
  loader: async () => {
    try {
      return await listFavorites();
    } catch {
      throw redirect({ to: "/unlock" });
    }
  },
  component: Favorites,
  head: () => ({
    meta: [
      { title: "Her Favorites — Our Album" },
      { name: "description", content: "A quiet collection of the moments she loves most." },
    ],
  }),
});

const TILTS = [-2.4, 1.8, -1.2, 2.6, -1.6, 1.4, -2.0, 0.9];

function Favorites() {
  const photos = Route.useLoaderData();

  return (
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <header className="text-center mb-14 rise-1">
          <p className="hand text-2xl text-[color:var(--rose-deep)]/80">
            the ones she keeps coming back to
          </p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2">Her Favorites</h1>
          <Flourish className="mt-6 mb-4" />
          <p className="text-muted-foreground max-w-md mx-auto italic leading-relaxed">
            A little corner for the photos that always make her smile.
          </p>
        </header>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="w-8 h-8 mx-auto text-[color:var(--rose-deep)]/50 mb-3" />
            <p className="text-muted-foreground italic">
              No favorites yet — mark a few from the chapter pages.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {photos.map((p: any, i: number) => {
              const tilt = TILTS[i % TILTS.length];
              return (
                <article
                  key={p.id}
                  className="break-inside-avoid"
                  style={{ transform: `rotate(${tilt}deg)` }}
                >
                  <div className="polaroid rounded-sm">
                    <span className="washi-tape" />
                    <img
                      src={p.image_url}
                      alt={p.title ?? ""}
                      className="w-full object-cover"
                    />
                    <figcaption className="pt-3 pb-1 text-center">
                      {p.title && (
                        <h3 className="serif italic text-xl text-ink">{p.title}</h3>
                      )}
                      {p.caption && (
                        <p className="hand text-base text-[color:var(--ink)]/70 mt-1 px-2">
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
        )}
      </div>
    </div>
  );
}
