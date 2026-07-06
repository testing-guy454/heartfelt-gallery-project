import { Sprig } from "@/components/album/Ornaments";

export function YearDivider({ year }: { year: number }) {
  return (
    <div
      className="relative flex items-center justify-center my-14 md:my-20"
      aria-label={`Year ${year}`}
    >
      <span
        aria-hidden
        className="flex-1 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--sepia) 55%, transparent) 40%, color-mix(in oklab, var(--sepia) 55%, transparent) 60%, transparent)",
        }}
      />
      <div className="mx-6 flex items-center gap-3">
        <Sprig className="w-10 text-[color:var(--pink-vivid)]/45" />
        <span
          className="hand text-4xl md:text-5xl text-[color:var(--rose-deep)] tracking-[0.02em]"
          style={{ transform: "rotate(-1.5deg)" }}
        >
          {year}
        </span>
        <Sprig flip className="w-10 text-[color:var(--pink-vivid)]/45" />
      </div>
      <span
        aria-hidden
        className="flex-1 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--sepia) 55%, transparent) 40%, color-mix(in oklab, var(--sepia) 55%, transparent) 60%, transparent)",
        }}
      />
    </div>
  );
}
