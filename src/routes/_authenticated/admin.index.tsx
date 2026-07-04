import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminListChapters, createChapter, deleteChapter, claimFirstAdmin, amIAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const router = useRouter();
  const check = useServerFn(amIAdmin);
  const list = useServerFn(adminListChapters);
  const create = useServerFn(createChapter);
  const remove = useServerFn(deleteChapter);
  const claim = useServerFn(claimFirstAdmin);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      const c = await list();
      setChapters(c);
    } catch (e: any) { setErr(e.message); }
  }

  useEffect(() => {
    check().then(async (r) => {
      setIsAdmin(r.isAdmin);
      if (r.isAdmin) await refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onClaim() {
    const r = await claim();
    if (r.ok) { setIsAdmin(true); await refresh(); }
    else setErr("Admin has already been claimed. Sign in with that account.");
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await create({ data: { title: newTitle.trim() } });
    setNewTitle("");
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this chapter and all its photos?")) return;
    await remove({ data: { id } });
    await refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  }

  if (isAdmin === null) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-24 paper rounded-2xl p-10 text-center">
        <h1 className="serif italic text-3xl">Claim keeper access</h1>
        <p className="text-sm text-muted-foreground mt-3">
          You're signed in but not yet the album keeper. If this is your first time, claim it.
        </p>
        <button onClick={onClaim} className="mt-6 rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wide">
          Become keeper
        </button>
        {err && <p className="text-destructive text-sm mt-3">{err}</p>}
        <button onClick={signOut} className="block mx-auto mt-6 text-xs text-muted-foreground">sign out</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="serif italic text-4xl">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage chapters and photos.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/album" className="text-primary underline">View album</Link>
          <button onClick={signOut} className="text-muted-foreground">Sign out</button>
        </div>
      </header>

      <form onSubmit={onCreate} className="paper rounded-xl p-5 flex gap-3 mb-8">
        <input
          value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New chapter title…"
          className="flex-1 bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
        />
        <button className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm uppercase tracking-wide">Add</button>
      </form>

      <div className="space-y-3">
        {chapters.map((c) => (
          <div key={c.id} className="paper rounded-xl p-5 flex items-center gap-5">
            <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
              {c.cover_url && <img src={c.cover_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="serif italic text-xl">{c.title}</h3>
              <p className="text-xs text-muted-foreground">/{c.slug}</p>
              {c.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.description}</p>}
            </div>
            <Link to="/admin/chapters/$id" params={{ id: c.id }} className="text-sm text-primary underline">
              Edit
            </Link>
            <button onClick={() => onDelete(c.id)} className="text-sm text-destructive">Delete</button>
          </div>
        ))}
        {chapters.length === 0 && <p className="text-center text-muted-foreground">No chapters yet.</p>}
      </div>

      {err && <p className="text-destructive text-sm mt-6">{err}</p>}
    </div>
  );
}
