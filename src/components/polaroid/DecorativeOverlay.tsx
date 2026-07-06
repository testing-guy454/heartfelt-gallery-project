/**
 * Scattered decorations (pushpins, dried sprigs, tickets, tape scraps).
 * pointer-events: none so they never block Polaroids.
 */
export function DecorativeOverlay({ width, height }: { width: number; height: number }) {
  // deterministic positions relative to canvas
  const pins = [
    { x: 0.06, y: 0.04, tone: "rose" },
    { x: 0.94, y: 0.03, tone: "gold" },
    { x: 0.5, y: 0.02, tone: "rose" },
    { x: 0.03, y: 0.5, tone: "gold" },
    { x: 0.97, y: 0.52, tone: "rose" },
    { x: 0.08, y: 0.96, tone: "rose" },
    { x: 0.92, y: 0.97, tone: "gold" },
    { x: 0.45, y: 0.98, tone: "rose" },
  ];

  const tickets = [
    { x: 0.02, y: 0.28, r: -6, label: "PLATFORM 3", sub: "PATNA JN" },
    { x: 0.86, y: 0.74, r: 5, label: "ROW G · 12", sub: "MONA CINEMA" },
  ];

  const stamps = [
    { x: 0.9, y: 0.16, r: 8 },
    { x: 0.05, y: 0.72, r: -4 },
  ];

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{ width, height }}
    >
      {pins.map((p, i) => (
        <span
          key={`pin-${i}`}
          className="push-pin"
          style={{
            left: p.x * width - 7,
            top: p.y * height - 7,
            background:
              p.tone === "gold"
                ? "radial-gradient(circle at 30% 30%, #ffe7a1 0%, var(--gold) 45%, #6b4b12 100%)"
                : undefined,
          }}
        />
      ))}

      {tickets.map((t, i) => (
        <div
          key={`ticket-${i}`}
          className="absolute"
          style={{
            left: t.x * width,
            top: t.y * height,
            transform: `rotate(${t.r}deg)`,
          }}
        >
          <div
            className="kraft-strip"
            style={{ fontFamily: "var(--font-stamp)", fontSize: "0.7rem", letterSpacing: "0.18em" }}
          >
            <div className="uppercase">{t.label}</div>
            <div className="text-[9px] opacity-80 mt-0.5">{t.sub}</div>
          </div>
        </div>
      ))}

      {stamps.map((s, i) => (
        <div
          key={`stamp-${i}`}
          className="absolute"
          style={{ left: s.x * width, top: s.y * height, transform: `rotate(${s.r}deg)` }}
        >
          <div className="postage-stamp" style={{ width: 54 }}>
            <div
              className="border border-[color:var(--sepia)]/40 flex items-center justify-center"
              style={{ width: 44, height: 52, fontFamily: "var(--font-hand)", fontSize: 14, color: "var(--rose-deep)" }}
            >
              ♥
            </div>
          </div>
        </div>
      ))}

      {/* stray washi tape scraps */}
      <span
        className="washi-tape"
        style={{
          position: "absolute",
          left: width * 0.22,
          top: height * 0.005,
          width: "5rem",
          transform: "rotate(-14deg)",
          opacity: 0.75,
        }}
      />
      <span
        className="washi-tape-gold"
        style={{
          position: "absolute",
          left: width * 0.7,
          top: height * 0.48,
          width: "6rem",
          transform: "rotate(9deg)",
          opacity: 0.7,
        }}
      />

      {/* pressed sprig cluster (top-left) */}
      <svg
        className="absolute"
        style={{ left: width * 0.01, top: height * 0.18, transform: "rotate(-18deg)", opacity: 0.7 }}
        width="80"
        height="110"
        viewBox="0 0 80 110"
      >
        <g fill="none" stroke="#5a6b3a" strokeWidth="1.2" strokeLinecap="round">
          <path d="M40 105 C 38 70, 44 40, 40 8" />
          <path d="M40 85 C 26 78, 18 68, 14 56" />
          <path d="M40 65 C 56 58, 62 46, 64 34" />
        </g>
        <g fill="#7a8b4a" opacity="0.85">
          <ellipse cx="14" cy="52" rx="5" ry="9" transform="rotate(-30 14 52)" />
          <ellipse cx="66" cy="30" rx="5" ry="9" transform="rotate(30 66 30)" />
        </g>
        <g fill="#b24a5e" opacity="0.9">
          <circle cx="40" cy="6" r="3.5" />
          <circle cx="45" cy="3" r="2.5" />
          <circle cx="35" cy="3" r="2.5" />
        </g>
      </svg>
    </div>
  );
}
