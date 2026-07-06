const LABEL_TONES = ["#d9b892", "#e6c39a", "#c9a274", "#e8cba1", "#d3ad7d"];

export function WallFilters({
  labels,
  active,
  onSelect,
  arrangement,
  onArrangementChange,
}: {
  labels: string[];
  active: string;
  onSelect: (l: string) => void;
  arrangement: "wall" | "chrono";
  onArrangementChange: (a: "wall" | "chrono") => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {labels.map((label, i) => {
        const isActive = active === label;
        const tilt = ((i * 7) % 5) - 2;
        return (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className="group relative focus:outline-none"
            style={{ transform: `rotate(${tilt}deg)` }}
          >
            <span
              className="hand text-[1.1rem] leading-none inline-block"
              style={{
                background: LABEL_TONES[i % LABEL_TONES.length],
                color: "#4a2f18",
                padding: "0.5rem 1.1rem 0.6rem 1.6rem",
                clipPath: "polygon(8% 0, 100% 0, 100% 100%, 8% 100%, 0 50%)",
                boxShadow: isActive
                  ? "0 0 0 2px color-mix(in oklab, var(--rose-deep) 70%, transparent), 0 6px 12px -6px rgba(0,0,0,0.4)"
                  : "0 4px 10px -6px rgba(0,0,0,0.4)",
                opacity: isActive ? 1 : 0.85,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}

      {/* arrangement toggle — as a folded paper switch */}
      <div
        className="ml-auto flex items-center gap-2 stamp-font text-[10px] tracking-[0.28em] uppercase text-[color:var(--letter-paper)]/95"
        style={{
          background: "rgba(30,15,5,0.45)",
          padding: "0.4rem 0.8rem",
          borderRadius: 999,
          border: "1px solid rgba(255,240,210,0.3)",
        }}
      >
        <span className="opacity-80">arrange by</span>
        <button
          onClick={() => onArrangementChange("wall")}
          className={`px-2 py-1 rounded-full transition-colors ${
            arrangement === "wall" ? "bg-[color:var(--pink-vivid)] text-white" : "opacity-70 hover:opacity-100"
          }`}
        >
          random wall
        </button>
        <button
          onClick={() => onArrangementChange("chrono")}
          className={`px-2 py-1 rounded-full transition-colors ${
            arrangement === "chrono" ? "bg-[color:var(--pink-vivid)] text-white" : "opacity-70 hover:opacity-100"
          }`}
        >
          chronological
        </button>
      </div>
    </div>
  );
}
