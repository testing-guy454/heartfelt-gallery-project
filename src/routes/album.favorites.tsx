import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listFavorites, getFavoritePhotos } from "@/lib/album.functions";
import { getFavoriteIds } from "@/lib/favorites";
import { GateNav } from "@/components/album/GateNav";
import { FavoriteButton } from "@/components/album/FavoriteButton";
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
  const adminFavorites = Route.useLoaderData();
  const [herFavorites, setHerFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchFav = useServerFn(getFavoritePhotos);

  useEffect(() => {
    const ids = getFavoriteIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetchFav({ data: { photo_ids: ids } })
      .then((photos: any[]) => setHerFavorites(photos))
      .finally(() => setLoading(false));
  }, [fetchFav]);


  const byId = new Map<string, any>();
  for (const p of adminFavorites) byId.set(p.id, p);
  for (const p of herFavorites) byId.set(p.id, p);
  const photos = [...byId.values()];

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
            A little corner for the photos that always make her smile. Tap the heart on any chapter or timeline photo to add it here.
          </p>
        </header>

        {loading || photos.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="w-8 h-8 mx-auto text-[color:var(--rose-deep)]/50 mb-3" />
            <p className="text-muted-foreground italic">
              {loading ? "Loading favorites…" : "No favorites yet — tap the heart on chapter or timeline photos to add them."}
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
                    <div className="relative">
                      <img
                        src={p.image_url}
                        alt={p.title ?? ""}
                        className="w-full object-cover"
                      />
                      <FavoriteButton
                        photoId={p.id}
                        className="absolute top-2 right-2"
                        onToggle={(isFav) => {
                          if (!isFav) {
                            setHerFavorites((prev) => prev.filter((x) => x.id !== p.id));
                          }
                        }}
                      />

                    </div>
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
