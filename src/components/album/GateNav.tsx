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
    <nav className="sticky top-0 z-30 w-full border-b border-[color:var(--gold)]/25 bg-background/70 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/album" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-full bg-[color:var(--rose-deep)]/10 text-[color:var(--rose-deep)] flex items-center justify-center group-hover:animate-[heartbeat_2s_ease-in-out_infinite]">
            <HeartIcon className="w-4 h-4" />
          </span>
          <span className="serif italic text-xl text-ink">Our Album</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/album"
            className="text-muted-foreground hover:text-[color:var(--rose-deep)] transition"
            activeProps={{ className: "text-[color:var(--rose-deep)]" }}
          >
            Chapters
          </Link>
          <Link
            to="/album/timeline"
            className="text-muted-foreground hover:text-[color:var(--rose-deep)] transition"
            activeProps={{ className: "text-[color:var(--rose-deep)]" }}
          >
            Timeline
          </Link>
          <button
            onClick={onLock}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-[color:var(--rose-deep)] transition"
          >
            Lock
          </button>
        </div>
      </div>
    </nav>
  );
}
