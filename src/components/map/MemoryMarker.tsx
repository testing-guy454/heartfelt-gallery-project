// SVG marker variants for Memory Map — used via Leaflet L.divIcon.
// Kept as pure string generators so we can pass HTML into divIcon options.

export type MarkerVariant = "seal" | "flower" | "heart" | "pin" | "stamp";

const VARIANTS: MarkerVariant[] = ["seal", "flower", "heart", "pin", "stamp"];

export function variantForId(id: string): MarkerVariant {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return VARIANTS[Math.abs(hash) % VARIANTS.length];
}

// Small handcrafted SVGs. Rotation is randomized-ish via id hash so the map
// feels hand-placed rather than aligned to a grid.
export function markerSVG(variant: MarkerVariant, tiltDeg: number): string {
  const t = `transform: rotate(${tiltDeg}deg);`;
  switch (variant) {
    case "seal":
      return `<div class="memory-marker-inner" style="${t}">
        <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="wg${tiltDeg|0}" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#e28ea4"/>
              <stop offset="55%" stop-color="#a83149"/>
              <stop offset="100%" stop-color="#5a1120"/>
            </radialGradient>
          </defs>
          <circle cx="17" cy="17" r="13" fill="url(#wg${tiltDeg|0})" stroke="#3b0a15" stroke-width="0.8"/>
          <text x="17" y="22" text-anchor="middle" font-family="Cormorant Garamond, serif" font-style="italic" font-size="15" fill="#f0d68a">m</text>
        </svg>
      </div>`;
    case "flower":
      return `<div class="memory-marker-inner" style="${t}">
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(15 15)">
            ${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-7" rx="4" ry="7" fill="#d99aa8" opacity="0.9" transform="rotate(${a})"/>`).join("")}
            <circle r="3.2" fill="#c48437"/>
            <circle r="1.4" fill="#f3d78e"/>
          </g>
        </svg>
      </div>`;
    case "heart":
      return `<div class="memory-marker-inner" style="${t}">
        <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z"
                fill="#c24560" stroke="#5a1120" stroke-width="0.8"/>
        </svg>
      </div>`;
    case "pin":
      return `<div class="memory-marker-inner" style="${t}">
        <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 33 C 13 24, 3 20, 3 12 A10 10 0 0 1 23 12 C 23 20, 13 24, 13 33 Z"
                fill="#8b4a2f" stroke="#3d1e10" stroke-width="0.8"/>
          <circle cx="13" cy="12" r="3.5" fill="#f3d78e"/>
        </svg>
      </div>`;
    case "stamp":
      return `<div class="memory-marker-inner" style="${t}">
        <svg width="30" height="34" viewBox="0 0 30 34" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="26" height="26" fill="#f4e3c3" stroke="#7a4a2b" stroke-dasharray="1.6 1.6" stroke-width="1"/>
          <circle cx="15" cy="17" r="7" fill="#c24560" opacity="0.8"/>
          <text x="15" y="20" text-anchor="middle" font-family="Special Elite, monospace" font-size="8" fill="#3d1e10">US</text>
        </svg>
      </div>`;
  }
}

export function tiltForId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 17 + id.charCodeAt(i)) | 0;
  return ((hash % 20) - 10); // -10..+10 degrees
}
