import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listMyChapters, createChapter, deleteChapter } from "@/lib/admin.functions";

import { requireNonAdminOrRedirect } from "@/lib/role-guard";

export const Route = createFileRoute("/_authenticated/my/chapters/")({
  beforeLoad: async () => { await requireNonAdminOrRedirect(); },
  component: MyChapters,
});

type Chapter = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  sort_order: number;
  created_by: string | null;
};

function MyChapters() {
  const router = useRouter();
  const list = useServerFn(listMyChapters);
  const create = useServerFn(createChapter);
  const remove = useServerFn(deleteChapter);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      const c = await list();
      setChapters(c as Chapter[]);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    refresh();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).maybeSingle();
      setDisplayName(p?.display_name ?? data.user.email?.split("@")[0] ?? "");
    });
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await create({ data: { title: newTitle.trim(), description: newDesc.trim() || undefined } });
      setNewTitle("");
      setNewDesc("");
      await refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this chapter and all its photos?")) return;
    await remove({ data: { id } });
    await refresh();
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/album" });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex items-start justify-between mb-8">
        <div>
          <Link to="/album" className="text-sm text-primary underline">← album</Link>
          <h1 className="serif italic text-4xl mt-2">Your chapters</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="italic">{displayName || "you"}</span>. Chapters you create are labelled with your name.
          </p>
        </div>
        <button onClick={onSignOut} className="text-xs text-muted-foreground hover:text-foreground">Sign out</button>
      </header>

      <form onSubmit={onCreate} className="paper rounded-xl p-5 space-y-3 mb-8">
        <h2 className="serif italic text-xl">New chapter</h2>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
          maxLength={80}
          className="w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
        />
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="A little note (optional)"
          rows={2}
          maxLength={280}
          className="w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
        />
        <button
          disabled={busy || !newTitle.trim()}
          className="rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wide disabled:opacity-50"
        >
          {busy ? "Creating…" : "Add chapter"}
        </button>
      </form>

      <div className="space-y-3">
        {chapters.map((c) => (
          <div key={c.id} className="paper rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
              {c.cover_url && <img src={c.cover_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="serif italic text-lg truncate">{c.title}</h3>
              <p className="text-xs text-muted-foreground">/{c.slug}</p>
              {c.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.description}</p>}
            </div>
            <Link to="/chapters/$id/edit" params={{ id: c.id }} className="text-sm text-primary underline">
              Edit
            </Link>
            <button onClick={() => onDelete(c.id)} className="text-sm text-destructive">Delete</button>
          </div>
        ))}
        {chapters.length === 0 && (
          <p className="text-center text-muted-foreground text-sm italic">No chapters yet — write your first one above.</p>
        )}
      </div>

      {err && <p className="text-destructive text-sm mt-6">{err}</p>}
    </div>
  );
}
