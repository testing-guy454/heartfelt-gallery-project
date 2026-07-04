import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { lockAlbum } from "@/lib/gate.functions";

export function GateNav() {
  const router = useRouter();
  const lock = useServerFn(lockAlbum);
  async function onLock() {
    await lock();
    await router.invalidate();
    router.navigate({ to: "/" });
  }
  return (
    <nav className="w-full border-b border-border/50 bg-background/70 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/album" className="serif italic text-xl text-ink">Our Album</Link>
        <div className="flex items-center gap-5 text-sm">
          <Link to="/album" className="text-muted-foreground hover:text-primary">Chapters</Link>
          <Link to="/album/timeline" className="text-muted-foreground hover:text-primary">Timeline</Link>
          <button onClick={onLock} className="text-muted-foreground hover:text-primary">Lock</button>
        </div>
      </div>
    </nav>
  );
}
