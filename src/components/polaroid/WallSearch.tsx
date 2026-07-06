export function WallSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="relative"
      style={{
        transform: "rotate(-1.5deg)",
        background:
          "repeating-linear-gradient(180deg, transparent 0 26px, color-mix(in oklab, var(--rose-deep) 22%, transparent) 26px 27px), linear-gradient(180deg, #fdf7e8, #f2e6cc)",
        border: "1px solid color-mix(in oklab, var(--sepia) 40%, transparent)",
        boxShadow: "0 10px 22px -14px rgba(80,50,20,0.45), inset 0 0 0 1px rgba(255,255,255,0.4)",
        padding: "0.5rem 0.9rem 0.6rem 2.2rem",
        borderRadius: "3px",
      }}
    >
      {/* red margin line */}
      <span
        aria-hidden
        className="absolute top-0 bottom-0"
        style={{
          left: "1.6rem",
          width: 1,
          background: "color-mix(in oklab, var(--rose-deep) 55%, transparent)",
        }}
      />
      {/* punch hole */}
      <span
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          width: 10,
          height: 10,
          background: "color-mix(in oklab, var(--sepia) 55%, #7a4a1a)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
        }}
      />
      <label className="sr-only" htmlFor="wall-search">
        Search memories
      </label>
      <input
        id="wall-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="look for a memory…"
        className="bg-transparent border-0 outline-none hand text-[1.25rem] text-[color:var(--ink)] placeholder:text-[color:var(--sepia)]/70 w-56"
      />
    </div>
  );
}
