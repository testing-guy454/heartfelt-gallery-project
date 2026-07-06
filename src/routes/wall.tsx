import { createFileRoute, redirect } from "@tanstack/react-router";
import { listTimeline } from "@/lib/album.functions";
import { GateNav } from "@/components/album/GateNav";
import { PolaroidWall } from "@/components/polaroid/PolaroidWall";
import { Flourish } from "@/components/album/Ornaments";

export const Route = createFileRoute("/wall")({
  loader: async () => {
    try {
      return await listTimeline();
    } catch {
      throw redirect({ to: "/" });
    }
  },
  component: WallPage,
  head: () => ({
    meta: [
      { title: "Polaroid Wall — Our Album" },
      {
        name: "description",
        content:
          "A corkboard of Polaroids, hand-pinned over the years — captions in ink, tape at the corners.",
      },
      { property: "og:title", content: "Polaroid Wall — Our Album" },
      {
        property: "og:description",
        content: "A corkboard of Polaroids, hand-pinned over the years.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function WallPage() {
  const photos = Route.useLoaderData();

  return (
    <div className="relative min-h-screen">
      <GateNav />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <header className="text-center mb-8 rise-1">
          <p className="hand text-2xl text-[color:var(--rose-deep)]/80">
            emptied from a shoebox, pinned one at a time
          </p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2">
            Polaroid Wall
          </h1>
          <Flourish className="mt-4 mb-2" />
        </header>
        <PolaroidWall photos={photos as any} />
      </div>
    </div>
  );
}
