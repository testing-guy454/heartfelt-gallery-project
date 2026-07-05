import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { lockAlbum } from "@/lib/gate.functions";
import { HeartIcon } from "./Ornaments";

export function GateNav() {
  const router = useRouter();
  const lock = useServerFn(lockAlbum);
  async function onLock() {
    await lock();
    await router.invalidate();
    router.navigate({ to: "/" });
  }

  return (
    <nav className="sticky top-0 z-30 w-full pointer-events-none">
      {/* torn paper strip */}
      <div
        className="relative pointer-events-auto"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--letter-paper) 96%, transparent) 0%, color-mix(in oklab, var(--letter-paper) 88%, transparent) 100%)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow:
            "0 1px 0 color-mix(in oklab, var(--gold) 25%, transparent), 0 10px 24px -18px color-mix(in oklab, var(--ink) 40%, transparent)",
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 6px), 98.5% 100%, 96% calc(100% - 4px), 93% 100%, 90% calc(100% - 5px), 86% 100%, 82% calc(100% - 3px), 78% 100%, 74% calc(100% - 6px), 70% 100%, 65% calc(100% - 4px), 60% 100%, 55% calc(100% - 5px), 50% 100%, 45% calc(100% - 3px), 40% 100%, 35% calc(100% - 6px), 30% 100%, 25% calc(100% - 4px), 20% 100%, 16% calc(100% - 5px), 12% 100%, 8% calc(100% - 3px), 4% 100%, 1.5% calc(100% - 6px), 0 100%)",
        }}
      >
        {/* faint ruled paper line + tea stain */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(180deg, transparent 0 22px, color-mix(in oklab, var(--gold) 12%, transparent) 22px 23px), radial-gradient(200px 60px at 22% 100%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between gap-6">
          {/* Brand — waxy heart seal + inked script */}
          <Link to="/album" className="group flex items-center gap-3 shrink-0">
            <span
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-[color:var(--letter-paper)] transition-transform group-hover:-rotate-6"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--pink-vivid) 55%, white) 0%, var(--rose-deep) 55%, color-mix(in oklab, var(--rose-deep) 70%, black) 100%)",
                boxShadow:
                  "inset 0 -2px 3px color-mix(in oklab, var(--ink) 40%, transparent), 0 2px 6px -2px color-mix(in oklab, var(--rose-deep) 60%, transparent)",
              }}
            >
              <HeartIcon className="w-4 h-4 drop-shadow-sm" />
            </span>
            <span className="leading-none">
              <span
                className="block hand text-2xl text-ink -mb-1"
                style={{ transform: "rotate(-2deg)", transformOrigin: "left" }}
              >
                Our Album
              </span>
              <span className="block text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
                — a keepsake
              </span>
            </span>
          </Link>

          {/* Nav — pinned index card */}
          <div
            className="hidden md:flex items-center gap-1 px-4 py-2 rounded-[2px]"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--letter-paper) 98%, white) 0%, color-mix(in oklab, var(--gold) 8%, var(--letter-paper)) 100%)",
              boxShadow:
                "0 1px 0 color-mix(in oklab, var(--gold) 30%, transparent) inset, 0 6px 14px -10px color-mix(in oklab, var(--ink) 40%, transparent), 0 1px 0 rgba(255,255,255,0.6) inset",
              border: "1px solid color-mix(in oklab, var(--gold) 25%, transparent)",
              transform: "rotate(-0.4deg)",
            }}
          >
            <NavItem to="/album" label="Chapters" />
            <span className="text-[color:var(--gold)]/60 select-none">·</span>
            <NavItem to="/album/timeline" label="Timeline" />
            <span className="text-[color:var(--gold)]/60 select-none">·</span>
            <button
              onClick={onLock}
              className="group relative px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-[color:var(--ink)]/70 hover:text-[color:var(--rose-deep)] transition-colors flex items-center gap-1.5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-3 h-3 opacity-70"
              >
                <rect x="5" y="11" width="14" height="9" rx="1.5" />
                <path d="M8 11V8a4 4 0 018 0v3" />
              </svg>
              Lock
              <span
                aria-hidden
                className="absolute left-2 right-2 -bottom-0.5 h-px scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--rose-deep), transparent)",
                }}
              />
            </button>
          </div>

          {/* Mobile — compact */}
          <div className="md:hidden flex items-center gap-4 text-xs">
            <NavItem to="/album" label="Chapters" compact />
            <NavItem to="/album/timeline" label="Timeline" compact />
            <button
              onClick={onLock}
              className="uppercase tracking-[0.22em] text-[10px] text-[color:var(--ink)]/70"
            >
              Lock
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  compact = false,
}: {
  to: "/album" | "/album/timeline";
  label: string;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      className={
        "group relative px-3 py-1.5 uppercase tracking-[0.28em] text-[color:var(--ink)]/70 hover:text-[color:var(--rose-deep)] transition-colors " +
        (compact ? "text-[10px]" : "text-[11px]")
      }
      activeProps={{
        className: "text-[color:var(--rose-deep)]",
      }}
    >
      {label}
      <span
        aria-hidden
        className="absolute left-2 right-2 -bottom-0.5 h-px scale-x-0 group-hover:scale-x-100 group-data-[status=active]:scale-x-100 origin-left transition-transform duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--rose-deep), transparent)",
        }}
      />
    </Link>
  );
}
