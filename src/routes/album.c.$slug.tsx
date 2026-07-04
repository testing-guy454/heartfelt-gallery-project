import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getChapter } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import { FloatingPetals, Flourish, HeartIcon, Sprig } from "@/components/album/Ornaments";

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
    <div className="relative min-h-screen">
      <FloatingPetals />
      <GateNav />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <Link
          to="/album"
          className="hand text-lg text-[color:var(--rose-deep)] hover:opacity-80"
        >
          ← all chapters
        </Link>

        <header className="relative text-center my-12 rise-1">
          <Sprig className="hidden md:block absolute -left-4 -top-6 w-16 text-[color:var(--rose-deep)]/40" />
          <Sprig
            flip
            className="hidden md:block absolute -right-4 -top-6 w-16 text-[color:var(--rose-deep)]/40"
          />
          <p className="hand text-2xl text-[color:var(--rose-deep)]/80">a chapter of us</p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2 leading-tight">
            {chapter.title}
          </h1>
          {(chapter.date_start || chapter.date_end) && (
            <p className="hand text-2xl text-[color:var(--rose-deep)]/70 mt-3">
              {formatRange(chapter.date_start, chapter.date_end)}
            </p>
          )}
          <Flourish className="mt-5 mb-4" />
          {chapter.description && (
            <p className="text-muted-foreground max-w-xl mx-auto italic leading-relaxed">
              {chapter.description}
            </p>
          )}
        </header>

        {chapter.song_url && (
          <div className="mb-12 paper-deep rounded-xl p-5 flex flex-col md:flex-row items-center gap-4 rise-2">
            <div className="flex items-center gap-2 shrink-0">
              <HeartIcon className="w-4 h-4 text-[color:var(--rose-deep)] animate-[heartbeat_2.4s_ease-in-out_infinite]" />
              <span className="hand text-xl text-[color:var(--rose-deep)]/80">
                a song for this chapter
              </span>
            </div>
            <audio controls src={chapter.song_url} className="flex-1 w-full" />
          </div>
        )}

        {photos.length === 0 ? (
          <p className="text-center text-muted-foreground italic">
            No photos in this chapter yet.
          </p>
        ) : (
          <div className="columns-1 md:columns-2 gap-8 [column-fill:_balance]">
            {photos.map((p: any, i: number) => {
              const tilt = (i % 4) - 1.5;
              return (
                <figure
                  key={p.id}
                  className="polaroid mb-8 break-inside-avoid inline-block w-full rise-2"
                  style={{ transform: `rotate(${tilt * 0.6}deg)` }}
                >
                  <span className="washi-tape" />
                  <button
                    onClick={() => setLightbox(i)}
                    className="block w-full overflow-hidden"
                  >
                    <img
                      src={p.image_url}
                      alt={p.title ?? ""}
                      className="w-full object-cover hover:scale-[1.03] transition duration-700"
                    />
                  </button>
                  <figcaption className="pt-3 px-1 text-center">
                    {p.title && (
                      <h3 className="serif italic text-2xl text-ink">{p.title}</h3>
                    )}
                    {p.taken_at && (
                      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
                        {new Date(p.taken_at).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {p.caption && (
                      <p className="hand text-xl text-[color:var(--ink)]/75 mt-2 leading-snug">
                        {p.caption}
                      </p>
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-ink/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-[fadeIn_300ms_ease]"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-[color:var(--gold)] hand text-2xl"
            onClick={() => setLightbox(null)}
          >
            close ×
          </button>
          <img
            src={photos[lightbox].image_url}
            alt=""
            className="max-h-[85vh] max-w-full object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function formatRange(a?: string | null, b?: string | null) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  if (a && b) return a === b ? fmt(a) : `${fmt(a)} — ${fmt(b)}`;
  if (a || b) return fmt((a || b)!);
  return "";
}
