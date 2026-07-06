import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { listMapChapters } from "@/lib/map.functions";
import { GateNav } from "@/components/album/GateNav";
import { Flourish } from "@/components/album/Ornaments";

const MemoryMap = lazy(() =>
  import("@/components/map/MemoryMap").then((m) => ({ default: m.MemoryMap })),
);

export const Route = createFileRoute("/map")({
  ssr: false,
  loader: async () => {
    try {
      return await listMapChapters();
    } catch {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Memory Map — Our Album" },
      { name: "description", content: "Every place that holds a memory — unfolded like an old travel journal." },
      { property: "og:title", content: "Memory Map — Our Album" },
      { property: "og:description", content: "Every place that holds a memory — unfolded like an old travel journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground italic">
      The map couldn't unfold. Try again in a moment.
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground italic">
      Nothing here.
    </div>
  ),
  component: MapPage,
});

function MapPage() {
  const chapters = Route.useLoaderData();
  return (
    <div className="relative min-h-screen">
      <GateNav />
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="text-center mb-10">
          <p className="hand text-2xl text-[color:var(--pink-vivid)]">unfold the map</p>
          <h1 className="serif italic text-5xl md:text-6xl text-ink mt-2">Memory Map</h1>
          <Flourish className="mt-5 mb-3" />
          <p className="text-muted-foreground max-w-lg mx-auto italic leading-relaxed">
            Every marker is a place where a chapter of us happened.
            Tap one to lift the postcard.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="aged-paper stitched rounded-sm p-10 text-center text-muted-foreground italic">
              Unfolding the map…
            </div>
          }
        >
          <MemoryMap chapters={chapters} />
        </Suspense>
      </div>
    </div>
  );
}
