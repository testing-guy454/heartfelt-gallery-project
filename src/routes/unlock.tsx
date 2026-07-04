import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { unlockAlbum, isAlbumUnlocked } from "@/lib/gate.functions";
import { FloatingPetals, HeartIcon, Flourish, CornerOrnament } from "@/components/album/Ornaments";

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

  useEffect(() => {
    if (unlocked) router.navigate({ to: "/album" });
  }, [unlocked, router]);

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
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <FloatingPetals />
      <form
        onSubmit={onSubmit}
        className="paper-deep relative rounded-2xl px-10 py-14 max-w-md w-full text-center rise-1"
      >
        <CornerOrnament position="tl" />
        <CornerOrnament position="tr" />
        <CornerOrnament position="bl" />
        <CornerOrnament position="br" />

        <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center bg-[color:var(--rose-deep)]/10 text-[color:var(--rose-deep)]">
          <HeartIcon className="w-7 h-7 animate-[heartbeat_2.4s_ease-in-out_infinite]" />
        </div>
        <p className="hand text-2xl text-[color:var(--rose-deep)]/80">a little key</p>
        <h1 className="serif text-4xl md:text-5xl italic text-ink mt-1">Say the word</h1>
        <Flourish className="my-5" />
        <p className="text-muted-foreground text-sm italic">
          the little word only you and I know
        </p>
        <input
          name="passcode"
          type="password"
          autoComplete="off"
          autoFocus
          placeholder="◦ ◦ ◦ ◦ ◦"
          className="mt-6 w-full bg-transparent border-b-2 border-input px-2 py-3 text-center text-xl tracking-[0.3em] focus:outline-none focus:border-[color:var(--rose-deep)] transition placeholder:text-muted-foreground/40"
        />
        {error && (
          <p className="hand text-lg text-destructive mt-3">
            hmm, that's not it — try again?
          </p>
        )}
        <div className="mt-8">
          <button type="submit" disabled={loading} className="btn-love disabled:opacity-60">
            <HeartIcon className="w-4 h-4" />
            {loading ? "opening…" : "unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}
