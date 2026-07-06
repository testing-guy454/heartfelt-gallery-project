import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  FloatingPetals,
  HeartIcon,
  Sprig,
  Flourish,
  Butterfly,
} from "@/components/album/Ornaments";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  loader: async () => await isAlbumUnlocked(),
  component: Cover,
});

function safeNext(next: string | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

async function landingAfterSignIn(): Promise<"/admin" | "/my/chapters"> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return "/my/chapters";
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return role ? "/admin" : "/my/chapters";
}

function Cover() {
  const { unlocked } = Route.useLoaderData();
  const router = useRouter();
  const unlock = useServerFn(unlockAlbum);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"whisper" | "signin" | "signup">("whisper");
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ name: string; landing: "/admin" | "/my/chapters" } | null>(null);

  useEffect(() => {
    if (unlocked) router.navigate({ to: "/album" });
  }, [unlocked, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      const [{ data: prof }, { data: role }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", data.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle(),
      ]);
      if (cancelled) return;
      setSession({
        name: prof?.display_name ?? data.user.email?.split("@")[0] ?? "friend",
        landing: role ? "/admin" : "/my/chapters",
      });
    })();
    return () => { cancelled = true; };
  }, []);

  async function onWhisper(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    const res = await unlock({ data: { passcode: value } });
    if (res.ok) {
      await router.invalidate();
      router.navigate({ to: "/album" });
    } else {
      setLoading(false);
      setError("Not quite. Try again.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }

  async function onCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        if (!displayName.trim()) throw new Error("Please add a name so your chapters can be credited.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/my/chapters`,
            data: { display_name: displayName.trim() },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const to = await landingAfterSignIn();
      router.navigate({ to });
    } catch (e: any) {
      setError(e.message ?? "Sign in failed");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setLoading(false);
    }
  }


  return (
    <div className="relative h-screen flex items-center justify-center px-6 py-6 overflow-hidden">
      <FloatingPetals />

      <Sprig className="hidden md:block absolute left-4 top-6 w-20 text-[color:var(--pink-vivid)]/50 rise-1" />
      <Sprig
        flip
        className="hidden md:block absolute right-4 bottom-6 w-20 text-[color:var(--pink-vivid)]/50 rise-2"
      />
      <Butterfly className="hidden md:block absolute right-16 top-10 w-10 text-[color:var(--pink-vivid)]/70 animate-[sway_7s_ease-in-out_infinite]" />
      <Butterfly className="hidden md:block absolute left-20 bottom-16 w-8 text-[color:var(--rose-deep)]/60 animate-[sway_9s_ease-in-out_infinite]" />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-5">
        {session && (
          <div
            className="w-full max-w-md rise-1 text-center px-6 py-4 bg-[color:var(--letter-paper)] border border-[color:var(--sepia)]/30 shadow-[0_14px_36px_-22px_rgba(80,40,30,0.5)]"
            style={{ transform: "rotate(0.4deg)" }}
          >
            <p className="stamp-font text-[0.55rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase">
              welcome back
            </p>
            <p className="serif italic text-2xl text-ink mt-1">
              {session.name}
            </p>
            <button
              type="button"
              onClick={() => router.navigate({ to: session.landing })}
              className="mt-3 inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[color:var(--rose-deep)]/60 text-[color:var(--rose-deep)] text-[0.68rem] tracking-[0.3em] uppercase hover:bg-[color:var(--rose-deep)] hover:text-[color:var(--primary-foreground)] transition-colors"
            >
              <HeartIcon className="w-3 h-3" />
              {session.landing === "/admin" ? "continue to admin" : "continue writing"}
            </button>
          </div>
        )}

      <form
        onSubmit={mode === "whisper" ? onWhisper : onCredentials}
        className={`relative w-full max-w-xl rise-1 ${shake ? "shake" : ""}`}
        style={{ transform: "rotate(-0.6deg)" }}
      >
        {/* vintage letter paper */}
        <div className="relative bg-[color:var(--letter-paper)] border border-[color:var(--sepia)]/25 px-8 sm:px-12 pt-10 pb-10 shadow-[0_28px_70px_-30px_rgba(80,40,30,0.5),0_2px_6px_rgba(80,40,30,0.12)] letter-paper">

          {/* aged grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/><feColorMatrix values='0 0 0 0 0.32 0 0 0 0 0.22 0 0 0 0 0.14 0 0 0 0.14 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* tea stains */}
          <div className="pointer-events-none absolute top-10 right-14 w-28 h-28 rounded-full bg-[color:var(--sepia)]/12 blur-2xl" />
          <div className="pointer-events-none absolute bottom-16 left-10 w-20 h-20 rounded-full bg-[color:var(--sepia)]/10 blur-xl" />

          {/* deckled edges */}
          <div className="pointer-events-none absolute inset-0 deckled" />

          {/* faint ruled lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, var(--sepia) 31px, var(--sepia) 32px)",
              backgroundPosition: "0 88px",
            }}
          />

          <div className="relative z-10 text-center">
            <p className="stamp-font text-[0.6rem] tracking-[0.5em] text-[color:var(--sepia)] uppercase">
              a keepsake · for you
            </p>

            <p className="hand text-3xl text-[color:var(--pink-vivid)] mt-3">for you, my love —</p>

            <h1 className="serif text-5xl sm:text-7xl mt-1 text-ink italic leading-[1.05]">
              Our
              <span className="mx-3 text-[color:var(--pink-vivid)]">&amp;</span>
              Always
            </h1>

            <Flourish className="mt-4 mb-3" />

            <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto italic">
              Every quiet morning, every messy laugh, every somewhere-we-got-lost — a little home for the moments I never want to forget.
            </p>

            {mode === "whisper" ? (
              <div className="mt-6 max-w-sm mx-auto">
                <label
                  htmlFor="passcode"
                  className="block stamp-font text-[0.58rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase mb-2"
                >
                  whisper the word
                </label>
                <input
                  id="passcode"
                  ref={inputRef}
                  name="passcode"
                  type="password"
                  autoComplete="off"
                  value={value}
                  onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
                  placeholder="our word"
                  className="relative z-10 w-full bg-transparent text-center font-serif italic text-2xl sm:text-[1.6rem] text-ink px-2 py-3 border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none transition-colors tracking-[0.18em] caret-[color:var(--rose-deep)] placeholder:text-[color:var(--sepia)]/45 placeholder:italic placeholder:tracking-[0.18em]"
                />
                <div className="min-h-[1.5rem] mt-2 relative z-10">
                  {error ? (
                    <p className="text-xs italic text-destructive">{error}</p>
                  ) : (
                    <p className="text-[11px] italic text-muted-foreground/80">
                      the one only you would guess
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !value.trim()}
                  className="mt-5 group inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[0.72rem] tracking-[0.32em] uppercase font-medium transition-all duration-300 hover:bg-[color:var(--pink-vivid)] hover:shadow-[0_20px_40px_-18px_color-mix(in_oklab,var(--rose-deep)_70%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HeartIcon className="w-3.5 h-3.5" />
                  <span>{loading ? "opening" : "open the album"}</span>
                </button>
              </div>
            ) : (
              <div className="mt-6 max-w-sm mx-auto text-left space-y-3">
                <p className="stamp-font text-[0.58rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase text-center mb-1">
                  {mode === "signup" ? "make yourself a keeper" : "sign in as keeper"}
                </p>
                {mode === "signup" && (
                  <label className="block text-sm">
                    <span className="text-muted-foreground text-xs italic">your name</span>
                    <input
                      type="text" required maxLength={40}
                      value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1 w-full bg-transparent border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none py-2 font-serif italic text-lg text-ink"
                    />
                  </label>
                )}
                <label className="block text-sm">
                  <span className="text-muted-foreground text-xs italic">email</span>
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full bg-transparent border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none py-2 font-serif italic text-lg text-ink"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground text-xs italic">password</span>
                  <input
                    type="password" required minLength={6}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full bg-transparent border-b border-[color:var(--sepia)]/45 focus:border-[color:var(--rose-deep)] outline-none py-2 font-serif italic text-lg text-ink"
                  />
                </label>
                <div className="min-h-[1.25rem]">
                  {error && <p className="text-xs italic text-destructive text-center">{error}</p>}
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[0.72rem] tracking-[0.32em] uppercase font-medium transition-all duration-300 hover:bg-[color:var(--pink-vivid)] disabled:opacity-50"
                  >
                    <HeartIcon className="w-3.5 h-3.5" />
                    <span>{loading ? "…" : mode === "signup" ? "create account" : "sign in"}</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                  className="block mx-auto text-[11px] italic text-muted-foreground/80 hover:text-[color:var(--rose-deep)]"
                >
                  {mode === "signin" ? "new here? create an account →" : "already have an account? sign in →"}
                </button>
              </div>
            )}

            <div className="gold-divider mt-6 mb-3 mx-auto w-40" />

            <button
              type="button"
              onClick={() => { setMode(mode === "whisper" ? "signin" : "whisper"); setError(null); }}
              className="stamp-font text-[9px] uppercase tracking-[0.35em] text-[color:var(--sepia)]/80 hover:text-[color:var(--rose-deep)]"
            >
              {mode === "whisper" ? "keeper? sign in →" : "← back to whisper the word"}
            </button>
          </div>

        </div>
      </form>
      </div>




      <style>{`
        @keyframes shakeX {
          0%,100% { transform: translateX(0) rotate(-0.6deg); }
          20% { transform: translateX(-6px) rotate(-0.6deg); }
          40% { transform: translateX(6px) rotate(-0.6deg); }
          60% { transform: translateX(-4px) rotate(-0.6deg); }
          80% { transform: translateX(4px) rotate(-0.6deg); }
        }
        .shake { animation: shakeX 380ms ease; }
        .letter-paper {
          clip-path: polygon(
            0% 1%, 2% 0%, 5% 1%, 8% 0%, 12% 1%, 16% 0%, 20% 1%, 24% 0%, 28% 1%, 32% 0%, 36% 1%, 40% 0%, 44% 1%, 48% 0%, 52% 1%, 56% 0%, 60% 1%, 64% 0%, 68% 1%, 72% 0%, 76% 1%, 80% 0%, 84% 1%, 88% 0%, 92% 1%, 96% 0%, 100% 1%,
            100% 98%, 98% 100%, 95% 99%, 92% 100%, 88% 99%, 84% 100%, 80% 99%, 76% 100%, 72% 99%, 68% 100%, 64% 99%, 60% 100%, 56% 99%, 52% 100%, 48% 99%, 44% 100%, 40% 99%, 36% 100%, 32% 99%, 28% 100%, 24% 99%, 20% 100%, 16% 99%, 12% 100%, 8% 99%, 4% 100%, 0% 99%
          );
        }
      `}</style>
    </div>
  );
}
