import type { SVGProps } from "react";
import sealCameo from "@/assets/seal-cameo.png.asset.json";

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 21s-7.5-4.6-10-9.3C.5 8.4 2.6 4 6.6 4c2 0 3.5 1 4.4 2.4C11.9 5 13.4 4 15.4 4c4 0 6.1 4.4 4.6 7.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

/** Ornate cameo mark — user-provided artwork, background removed */
export function SealIcon({ size = 48 }: { size?: number }) {
  return (
    <img
      src={sealCameo.url}
      alt=""
      width={size}
      height={size}
      className="shrink-0 select-none"
      style={{ objectFit: "contain" }}
      draggable={false}
      aria-hidden
    />
  );
}

export function Sprig({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M60 155 C 55 110, 65 70, 60 15" />
        <path d="M60 130 C 40 122, 30 108, 26 92" />
        <path d="M60 108 C 82 100, 92 84, 96 66" />
        <path d="M60 82 C 44 74, 36 60, 34 44" />
        <path d="M60 58 C 78 52, 86 40, 88 24" />
      </g>
      <g fill="currentColor" opacity="0.9">
        <ellipse cx="24" cy="88" rx="6" ry="10" transform="rotate(-30 24 88)" />
        <ellipse cx="98" cy="62" rx="6" ry="10" transform="rotate(35 98 62)" />
        <ellipse cx="32" cy="40" rx="6" ry="10" transform="rotate(-25 32 40)" />
        <ellipse cx="90" cy="20" rx="6" ry="10" transform="rotate(30 90 20)" />
        <ellipse cx="60" cy="14" rx="5" ry="8" />
      </g>
      <g fill="currentColor" opacity="0.85">
        <circle cx="60" cy="10" r="3" />
        <circle cx="66" cy="6" r="2.5" />
        <circle cx="54" cy="6" r="2.5" />
      </g>
    </svg>
  );
}

export function Flourish({ className = "" }: { className?: string }) {
  return (
    <div className={`flourish ${className}`}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3l1.8 5.6L19 10l-4.6 2 -1 5 -2.6-4-5 -.4 3.8-3.2L8 3.6 12 6z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

export function FloatingPetals() {
  const petals = [
    { left: "6%", top: "12%", delay: "0s", size: 42, tilt: -14 },
    { left: "84%", top: "18%", delay: "-4s", size: 52, tilt: 22 },
    { left: "14%", top: "72%", delay: "-8s", size: 36, tilt: 30 },
    { left: "78%", top: "66%", delay: "-2s", size: 46, tilt: -18 },
    { left: "48%", top: "8%", delay: "-6s", size: 30, tilt: 5 },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 40 40"
          width={p.size}
          height={p.size}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            animation: `floatSlow ${16 + i * 2}s ease-in-out ${p.delay} infinite`,
            transform: `rotate(${p.tilt}deg)`,
            opacity: 0.55,
          }}
          aria-hidden
        >
          <path
            d="M20 4 C 28 10, 34 18, 20 36 C 6 18, 12 10, 20 4 Z"
            fill="color-mix(in oklab, var(--pink-vivid) 55%, white)"
            stroke="color-mix(in oklab, var(--pink-vivid) 65%, white)"
            strokeWidth="0.6"
          />
        </svg>
      ))}
    </div>
  );
}

export function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-3 left-3",
    tr: "top-3 right-3 rotate-90",
    bl: "bottom-3 left-3 -rotate-90",
    br: "bottom-3 right-3 rotate-180",
  } as const;
  return (
    <svg
      viewBox="0 0 60 60"
      className={`absolute w-10 h-10 text-[color:var(--gold)] opacity-70 ${map[position]}`}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M6 30 C 6 16, 16 6, 30 6" />
        <path d="M12 30 C 12 20, 20 12, 30 12" />
        <circle cx="30" cy="6" r="1.6" fill="currentColor" />
        <circle cx="6" cy="30" r="1.6" fill="currentColor" />
        <path d="M14 14 l4 4" />
      </g>
    </svg>
  );
}

/** Little triangular photo corners like in a real scrapbook */
export function PhotoCorners() {
  return (
    <>
      <span className="photo-corner" style={{ top: -2, left: -2 }} />
      <span className="photo-corner" style={{ top: -2, right: -2, transform: "scaleX(-1)" }} />
      <span className="photo-corner" style={{ bottom: -2, left: -2, transform: "scaleY(-1)" }} />
      <span className="photo-corner" style={{ bottom: -2, right: -2, transform: "scale(-1,-1)" }} />
    </>
  );
}

/** A rotated round postmark stamp */
export function Postmark({ label = "Par Avion", city = "Our City" }: { label?: string; city?: string }) {
  return (
    <div className="postmark">
      <div>{city}</div>
      <div className="text-[9px] opacity-80">· {label} ·</div>
    </div>
  );
}

/** A vintage postage stamp illustration with a tiny scene */
export function PostageStamp({ className = "" }: { className?: string }) {
  return (
    <div className={`postage-stamp inline-block ${className}`} aria-hidden>
      <div className="border border-[color:var(--sepia)]/40 p-2">
        <svg viewBox="0 0 60 70" width="54" height="64">
          <rect x="0" y="0" width="60" height="70" fill="color-mix(in oklab, var(--pink-vivid) 12%, white)" />
          <g fill="none" stroke="color-mix(in oklab, var(--rose-deep) 90%, black)" strokeWidth="0.8">
            <path d="M6 46 C 18 30, 26 22, 40 20 L 44 22 L 40 30 C 30 32, 20 40, 12 52 Z" fill="color-mix(in oklab, var(--pink-vivid) 55%, white)" />
            <circle cx="46" cy="14" r="3" fill="color-mix(in oklab, var(--gold) 80%, white)" />
            <path d="M4 60 L 56 60" />
          </g>
          <text x="30" y="66" textAnchor="middle" fontFamily="Special Elite" fontSize="6" fill="color-mix(in oklab, var(--rose-deep) 90%, black)">
            LOVE · 1¢
          </text>
        </svg>
      </div>
    </div>
  );
}

/** Little butterfly for whimsy */
export function Butterfly({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 50" className={className} aria-hidden>
      <g fill="currentColor" opacity="0.85">
        <path d="M30 25 C 20 6, 4 6, 6 20 C 8 32, 22 30, 30 25 Z" />
        <path d="M30 25 C 40 6, 56 6, 54 20 C 52 32, 38 30, 30 25 Z" />
        <path d="M30 25 C 24 34, 18 40, 14 44 C 22 44, 28 36, 30 30 Z" />
        <path d="M30 25 C 36 34, 42 40, 46 44 C 38 44, 32 36, 30 30 Z" />
      </g>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="30" y1="10" x2="30" y2="34" />
        <path d="M30 10 q -2 -4 -5 -5" fill="none" />
        <path d="M30 10 q 2 -4 5 -5" fill="none" />
      </g>
    </svg>
  );
}
