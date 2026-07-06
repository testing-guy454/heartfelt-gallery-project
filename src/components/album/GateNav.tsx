import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { lockAlbum } from "@/lib/gate.functions";
import { supabase } from "@/integrations/supabase/client";
import { SealIcon } from "./Ornaments";

export function GateNav() {
  const router = useRouter();
  const lock = useServerFn(lockAlbum);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [identity, setIdentity] = useState<{ name: string; isAdmin: boolean } | null>(null);

  async function loadIdentity() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) { setSignedIn(false); setIdentity(null); return; }
    setSignedIn(true);
    const [{ data: prof }, { data: role }] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", data.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle(),
    ]);
    setIdentity({
      name: prof?.display_name ?? data.user.email?.split("@")[0] ?? "you",
      isAdmin: !!role,
    });
  }

  useEffect(() => {
    loadIdentity();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { loadIdentity(); });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

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
          <span className="relative inline-flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
            <SealIcon size={44} />
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
          <NavLink to="/anniversary" label="Our Journey" />
          <Dot />
          <NavLink to="/wall" label="Polaroid Wall" />
          <Dot />
          <NavLink to="/map" label="Memory Map" />
          <Dot />
          <NavLink to="/album/favorites" label="Favorites" />
          <Dot />
          {signedIn ? (
            <NavLink to="/my/chapters" label="Your chapters" />
          ) : (
            <NavLink to="/auth" label="Sign in" />
          )}

          <Dot />
          {identity && <IdentityTag name={identity.name} isAdmin={identity.isAdmin} />}
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
  to: "/album" | "/album/timeline" | "/album/favorites" | "/anniversary" | "/wall" | "/map" | "/my/chapters" | "/auth";
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

// Small vintage paper-tag showing "editing as ..." — hand-torn corners, string knot dot
function IdentityTag({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const verb = isAdmin ? "editing as" : "writing as";
  return (
    <span
      title={`Signed in as ${name}`}
      className="hidden md:inline-flex items-center gap-2 px-3 py-1 select-none"
      style={{
        background: "color-mix(in oklab, var(--letter-paper) 85%, transparent)",
        border: "1px solid color-mix(in oklab, var(--sepia) 30%, transparent)",
        boxShadow: "0 6px 14px -10px rgba(80,40,30,0.4)",
        transform: "rotate(-1.2deg)",
        clipPath: "polygon(6% 0%, 100% 0%, 100% 82%, 94% 100%, 0% 100%, 0% 18%)",
      }}
    >
      <span
        aria-hidden
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "color-mix(in oklab, var(--rose-deep) 70%, transparent)" }}
      />
      <span className="stamp-font text-[8px] tracking-[0.34em] text-[color:var(--sepia)]/85 uppercase">
        {verb}
      </span>
      <span className="serif italic text-[13px] leading-none text-ink">
        {name}
      </span>
    </span>
  );
}
