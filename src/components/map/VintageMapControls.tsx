// Decorative compass rose overlay + stitched frame corner ornaments.

export function CompassRose({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g transform="translate(40 40)">
        <circle r="30" fill="none" stroke="#7a4a2b" strokeWidth="0.8" opacity="0.7" />
        <circle r="24" fill="none" stroke="#7a4a2b" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 2" />
        {/* Cardinal points */}
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <polygon points="0,-28 3,-6 0,0 -3,-6" fill="#8b4a2f" opacity="0.85" />
            <polygon points="0,-28 3,-6 0,0" fill="#5a2a15" opacity="0.9" />
          </g>
        ))}
        {/* Intercardinal points */}
        {[45, 135, 225, 315].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <polygon points="0,-20 2,-6 0,0 -2,-6" fill="#c48437" opacity="0.7" />
          </g>
        ))}
        <circle r="3" fill="#5a2a15" />
        <text y="-32" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="10" fill="#5a2a15">N</text>
      </g>
    </svg>
  );
}
