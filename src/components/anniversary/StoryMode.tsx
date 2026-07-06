import { useEffect, useState } from "react";
import type { Milestone } from "@/lib/anniversary.functions";
import { MilestoneCard } from "./MilestoneCard";
import { HeartIcon } from "@/components/album/Ornaments";

export function StoryMode({
  milestones,
  onClose,
}: {
  milestones: Milestone[];
  onClose: () => void;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((p) => Math.min(p + 1, milestones.length - 1));
      if (e.key === "ArrowLeft") setI((p) => Math.max(p - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [milestones.length, onClose]);

  const current = milestones[i];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story mode"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 py-10"
      style={{
        background:
          "radial-gradient(ellipse at center, color-mix(in oklab, var(--background) 96%, transparent), color-mix(in oklab, var(--background) 98%, transparent))",
        backdropFilter: "blur(6px)",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close story mode"
        className="absolute top-6 right-6 stamp-font text-[10px] tracking-[0.4em] uppercase text-[color:var(--sepia)] hover:text-[color:var(--rose-deep)] transition"
      >
        close ×
      </button>

      <div key={current.id} className="w-full max-w-2xl animate-fade-in">
        <MilestoneCard milestone={current} index={i} side="left" />
      </div>

      <div className="mt-8 flex items-center gap-6">
        <button
          onClick={() => setI((p) => Math.max(p - 1, 0))}
          disabled={i === 0}
          className="serif italic text-lg text-ink/70 hover:text-[color:var(--rose-deep)] disabled:opacity-30 transition"
        >
          ← back
        </button>
        <span className="hand text-lg text-[color:var(--pink-vivid)] flex items-center gap-2">
          <HeartIcon className="w-3 h-3" />
          {i + 1} of {milestones.length}
        </span>
        <button
          onClick={() => setI((p) => Math.min(p + 1, milestones.length - 1))}
          disabled={i === milestones.length - 1}
          className="serif italic text-lg text-ink/70 hover:text-[color:var(--rose-deep)] disabled:opacity-30 transition"
        >
          next →
        </button>
      </div>
    </div>
  );
}
