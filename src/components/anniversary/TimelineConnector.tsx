// A hand-drawn stitched thread connecting two milestone cards.
// Side determines which way it curves.
export function TimelineConnector({ side }: { side: "left" | "right" }) {
  const path =
    side === "left"
      ? "M 50 0 C 80 40, 20 80, 50 120"
      : "M 50 0 C 20 40, 80 80, 50 120";
  return (
    <div
      className="pointer-events-none flex justify-center my-2 md:my-4"
      aria-hidden
    >
      <svg
        viewBox="0 0 100 120"
        width="60"
        height="72"
        className="text-[color:var(--rose-deep)]/55"
      >
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <circle cx="50" cy="0" r="2" fill="currentColor" />
        <circle cx="50" cy="120" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
