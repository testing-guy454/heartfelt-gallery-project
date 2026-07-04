import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.navigate({ to: "/admin" });
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    }
    router.navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="paper rounded-2xl px-10 py-12 max-w-md w-full">
        <h1 className="serif italic text-4xl text-ink text-center">Keeper's entrance</h1>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Only you sign in here to add photos.
        </p>
        <div className="gold-divider my-6" />
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
          {mode === "signin" ? "First time? Create your keeper account →" : "Already have an account? Sign in →"}
        </button>
      </form>
    </div>
  );
}
