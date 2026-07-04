import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";

export const Route = createFileRoute("/unlock")({
  loader: async () => await isAlbumUnlocked(),
  component: Unlock,
});

function Unlock() {
  const { unlocked } = Route.useLoaderData();
  const router = useRouter();
  const unlock = useServerFn(unlockAlbum);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (unlocked) {
    // Already unlocked — go straight in
    router.navigate({ to: "/album" });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const fd = new FormData(e.currentTarget);
    const passcode = String(fd.get("passcode") ?? "");
    const res = await unlock({ data: { passcode } });
    setLoading(false);
    if (res.ok) {
      await router.invalidate();
      router.navigate({ to: "/album" });
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="paper rounded-2xl px-10 py-12 max-w-md w-full text-center">
        <h1 className="serif text-4xl italic text-ink">A small key</h1>
        <div className="gold-divider my-4 mx-auto w-24" />
        <p className="text-muted-foreground text-sm">Enter the little word I gave you.</p>
        <input
          name="passcode"
          type="password"
          autoComplete="off"
          autoFocus
          className="mt-6 w-full bg-transparent border-b border-input px-2 py-2 text-center text-lg focus:outline-none focus:border-primary transition"
        />
        {error && <p className="text-destructive text-sm mt-3">That's not it — try again?</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 inline-flex items-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm tracking-wide uppercase shadow-md hover:shadow-lg transition disabled:opacity-60"
        >
          {loading ? "Opening…" : "Open"}
        </button>
      </form>
    </div>
  );
}
