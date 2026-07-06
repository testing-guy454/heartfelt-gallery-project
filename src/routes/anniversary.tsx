import { createFileRoute, redirect } from "@tanstack/react-router";
import { listMilestones } from "@/lib/anniversary.functions";
import { GateNav } from "@/components/album/GateNav";
import { AnniversaryTimeline } from "@/components/anniversary/AnniversaryTimeline";
import { FloatingPetals, Butterfly, Sprig } from "@/components/album/Ornaments";

export const Route = createFileRoute("/anniversary")({
  loader: async () => {
    try {
      return await listMilestones();
    } catch {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Our Journey — Anniversary Timeline" },
      { name: "description", content: "The milestones of our love story — a handcrafted anniversary scrapbook." },
      { property: "og:title", content: "Our Journey — Anniversary Timeline" },
      { property: "og:description", content: "The milestones of our love story — a handcrafted anniversary scrapbook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground italic">
      The scrapbook wouldn't open. Try again in a moment.
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground italic">
      Nothing here.
    </div>
  ),
  component: AnniversaryPage,
});

function AnniversaryPage() {
  const { milestones, settings } = Route.useLoaderData();
  return (
    <div className="relative min-h-dvh">
      <FloatingPetals />
      <GateNav />
      <Butterfly className="hidden md:block absolute right-14 top-28 w-10 text-[color:var(--pink-vivid)]/50 animate-[sway_9s_ease-in-out_infinite]" />
      <Sprig className="hidden lg:block absolute left-2 top-40 w-24 text-[color:var(--pink-vivid)]/30" />
      <Sprig flip className="hidden lg:block absolute right-2 bottom-40 w-24 text-[color:var(--pink-vivid)]/30" />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-14">
        <header className="text-center mb-6">
          <p className="hand text-2xl text-[color:var(--pink-vivid)]">the story of us</p>
          <h1 className="serif italic text-5xl md:text-7xl text-ink mt-2 leading-[1.05]">
            Our Journey
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto italic leading-relaxed mt-5">
            Every milestone that shaped us — from the first hello to the very last page still to be written.
          </p>
        </header>

        <AnniversaryTimeline milestones={milestones} settings={settings} />
      </main>
    </div>
  );
}
