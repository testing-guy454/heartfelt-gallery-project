import { useEffect, useRef, useState } from "react";
import type { Milestone, RelationshipSettings } from "@/lib/anniversary.functions";
import { AnniversaryCounter } from "./AnniversaryCounter";
import { YearDivider } from "./YearDivider";
import { MilestoneCard } from "./MilestoneCard";
import { TimelineConnector } from "./TimelineConnector";
import { StoryMode } from "./StoryMode";
import { Flourish } from "@/components/album/Ornaments";

export function AnniversaryTimeline({
  milestones,
  settings,
}: {
  milestones: Milestone[];
  settings: RelationshipSettings;
}) {
  const [storyMode, setStoryMode] = useState(false);

  if (milestones.length === 0) {
    return (
      <div className="relative">
        <AnniversaryCounter startDate={settings.start_date} tagline={settings.tagline} />
        <div className="paper aged-paper stitched rounded-sm p-12 text-center max-w-xl mx-auto mt-8">
          <p className="hand text-2xl text-[color:var(--pink-vivid)]">
            our story is waiting to be written.
          </p>
          <p className="serif italic text-ink/70 mt-3">
            Add the first milestone from the admin editor.
          </p>
        </div>
      </div>
    );
  }

  // Group by year, preserve order
  const groups: { year: number; items: Milestone[] }[] = [];
  for (const m of milestones) {
    const y = new Date(m.date + "T00:00:00").getFullYear();
    const last = groups[groups.length - 1];
    if (last && last.year === y) last.items.push(m);
    else groups.push({ year: y, items: [m] });
  }

  return (
    <div className="relative">
      <AnniversaryCounter startDate={settings.start_date} tagline={settings.tagline} />

      <div className="text-center mb-8">
        <button
          onClick={() => setStoryMode(true)}
          className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[0.7rem] tracking-[0.34em] uppercase hover:bg-[color:var(--pink-vivid)] transition-colors"
        >
          <span aria-hidden>❤</span>
          Read in story mode
        </button>
      </div>

      <Flourish className="mb-6" />

      <ol
        className="relative list-none p-0 m-0"
        aria-label="Anniversary timeline"
      >
        {groups.map((g, gi) => (
          <li key={g.year} className="list-none">
            <YearDivider year={g.year} />
            <div className="space-y-0">
              {g.items.map((m, mi) => {
                const globalIndex =
                  groups.slice(0, gi).reduce((a, b) => a + b.items.length, 0) + mi;
                const side: "left" | "right" = globalIndex % 2 === 0 ? "left" : "right";
                const isLast =
                  gi === groups.length - 1 && mi === g.items.length - 1;
                return (
                  <div key={m.id}>
                    <RevealOnScroll>
                      <MilestoneCard milestone={m} index={globalIndex} side={side} />
                    </RevealOnScroll>
                    {!isLast && (
                      <TimelineConnector
                        side={side === "left" ? "right" : "left"}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="text-center mt-16">
        <Flourish className="mb-4" />
        <p className="hand text-2xl text-[color:var(--pink-vivid)]">
          and the next page is still being written…
        </p>
      </div>

      {storyMode && (
        <StoryMode milestones={milestones} onClose={() => setStoryMode(false)} />
      )}
    </div>
  );
}

function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 800ms ease-out, transform 800ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
