import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

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

function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const to = await landingAfterSignIn();
        router.navigate({ to });
      }
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "signup") {
      if (!displayName.trim()) { setError("Please add a name so your chapters can be credited."); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/my/chapters`,
          data: { display_name: displayName.trim() },
        },
      });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    }
    const to = await landingAfterSignIn();
    router.navigate({ to });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="paper rounded-2xl px-10 py-12 max-w-md w-full">
        <h1 className="serif italic text-4xl text-ink text-center">
          {mode === "signup" ? "Make yourself a keeper" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {mode === "signup"
            ? "Sign in and add your own chapters — every one will be marked with your name."
            : "Sign in to add or edit your chapters."}
        </p>
        <div className="gold-divider my-6" />

        {mode === "signup" && (
          <label className="text-sm block mb-3">
            <span className="text-muted-foreground">Your name (shown on your chapters)</span>
            <input
              type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              className="mt-1 w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
            />
          </label>
        )}

        <label className="text-sm block mb-3">
          <span className="text-muted-foreground">Email</span>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm block">
          <span className="text-muted-foreground">Password</span>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
          />
        </label>
        {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        <button
          disabled={loading}
          className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm uppercase tracking-wide disabled:opacity-60"
        >
          {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? "New here? Create an account →" : "Already have an account? Sign in →"}
        </button>
      </form>
    </div>
  );
}
