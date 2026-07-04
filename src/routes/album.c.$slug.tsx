import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getChapter } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";

export const Route = createFileRoute("/album/c/$slug")({
  loader: async ({ params }) => {
    try {
      return await getChapter({ data: { slug: params.slug } });
    } catch (e: any) {
      if (e?.message === "locked") throw redirect({ to: "/unlock" });
      throw e;
    }
  },
  component: ChapterView,
});

function ChapterView() {
  const { chapter, photos } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % photos.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, photos.length]);

  return (
    <div className="min-h-screen">
      <GateNav />
      <div className="max-w-4xl mx-auto px-6 py-14">
        <Link to="/album" className="text-sm text-primary underline underline-offset-4">← all chapters</Link>
        <header className="text-center my-10">
          <h1 className="serif italic text-5xl md:text-6xl text-ink">{chapter.title}</h1>
          {(chapter.date_start || chapter.date_end) && (
            <p className="hand text-2xl text-primary/70 mt-2">
              {formatRange(chapter.date_start, chapter.date_end)}
            </p>
          )}
          <div className="gold-divider my-5 mx-auto w-32" />
          {chapter.description && (
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">{chapter.description}</p>
          )}
        </header>

        {chapter.song_url && (
          <div className="mb-10 paper rounded-xl p-4 flex items-center gap-3">
            <span className="hand text-lg text-primary/80">a song for this chapter →</span>
            <audio controls src={chapter.song_url} className="flex-1" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {photos.map((p, i) => (
            <figure key={p.id} className="paper rounded-2xl overflow-hidden">
              <button onClick={() => setLightbox(i)} className="block w-full overflow-hidden">
                <img
                  src={p.image_url}
                  alt={p.title ?? ""}
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition duration-700"
                />
              </button>
              <figcaption className="p-5">
                {p.title && <h3 className="serif italic text-2xl text-ink">{p.title}</h3>}
                {p.taken_at && (
                  <p className="hand text-lg text-primary/70">{new Date(p.taken_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
                )}
                {p.caption && <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{p.caption}</p>}
              </figcaption>
            </figure>
          ))}
        </div>

        {photos.length === 0 && (
          <p className="text-center text-muted-foreground">No photos in this chapter yet.</p>
        )}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-ink/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <img
            src={photos[lightbox].image_url}
            alt=""
            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function formatRange(a?: string | null, b?: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  if (a || b) return fmt((a || b)!);
  return "";
}
