import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { lockAlbum } from "@/lib/gate.functions";
import { SealIcon } from "./Ornaments";

export function GateNav() {
  const router = useRouter();
  const lock = useServerFn(lockAlbum);
  async function onLock() {
    await lock();
    await router.invalidate();
    router.navigate({ to: "/" });
  }

  return (
    <nav
      className="sticky top-0 z-30 w-full"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--background) 82%, transparent) 0%, color-mix(in oklab, var(--background) 55%, transparent) 100%)",
        backdropFilter: "blur(8px) saturate(1.05)",
        WebkitBackdropFilter: "blur(8px) saturate(1.05)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-6">
        {/* Brand — a small monogram, quiet and letterhead-like */}
        <Link
          to="/album"
          className="group flex items-center gap-3 shrink-0"
          aria-label="Our Album — home"
        >
          <span className="relative inline-flex items-center justify-center text-[color:var(--ink)] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
            <SealIcon size={30} />
          </span>
          <span
            className="serif italic text-[19px] leading-none text-ink tracking-tight"
            style={{ letterSpacing: "0.005em" }}
          >
            Our Album
          </span>
        </Link>

        {/* Nav — serif italic, hand-drawn hover underline, small gold dots */}
        <div className="flex items-center gap-5 md:gap-7">
          <NavLink to="/album" label="Chapters" />
          <Dot />
          <NavLink to="/album/timeline" label="Timeline" />
          <Dot />
          <button
            onClick={onLock}
            className="group relative serif italic text-[15px] md:text-[16px] leading-none text-[color:var(--ink)]/60 hover:text-[color:var(--rose-deep)] transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="w-3 h-3 opacity-80 -translate-y-px"
            >
              <rect x="6" y="11" width="12" height="9" rx="1.2" />
              <path d="M9 11V8a3 3 0 016 0v3" />
            </svg>
            Lock
            <Underline />
          </button>
        </div>
      </div>

      {/* gold hairline, drawn like an ink underline of the letterhead */}
      <div
        aria-hidden
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--gold) 55%, transparent) 20%, color-mix(in oklab, var(--gold) 70%, transparent) 50%, color-mix(in oklab, var(--gold) 55%, transparent) 80%, transparent 100%)",
        }}
      />
    </nav>
  );
}

function NavLink({
  to,
  label,
}: {
  to: "/album" | "/album/timeline";
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group relative serif italic text-[15px] md:text-[16px] leading-none text-[color:var(--ink)]/60 hover:text-[color:var(--rose-deep)] transition-colors"
      activeProps={{
        className: "text-[color:var(--rose-deep)]",
      }}
    >
      {label}
      <Underline />
    </Link>
  );
}

function Underline() {
  return (
    <span
      aria-hidden
      className="absolute left-0 right-0 -bottom-1.5 h-[3px] opacity-0 group-hover:opacity-100 group-data-[status=active]:opacity-100 transition-opacity"
      style={{
        background:
          "radial-gradient(ellipse at center, color-mix(in oklab, var(--rose-deep) 60%, transparent) 0%, transparent 70%)",
      }}
    />
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="w-1 h-1 rounded-full bg-[color:var(--gold)]/60"
    />
  );
}
