import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminGetChapter, updateChapter, addPhoto, updatePhoto, deletePhoto } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/chapters/$id")({
  component: EditChapter,
});

function EditChapter() {
  const { id } = Route.useParams();
  const load = useServerFn(adminGetChapter);
  const saveChapter = useServerFn(updateChapter);
  const addP = useServerFn(addPhoto);
  const updP = useServerFn(updatePhoto);
  const delP = useServerFn(deletePhoto);

  const [chapter, setChapter] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newDate, setNewDate] = useState("");

  async function refresh() {
    const r = await load({ data: { id } });
    setChapter(r.chapter);
    setPhotos(r.photos);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function onSaveChapter(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await saveChapter({ data: {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      cover_url: chapter.cover_url,
      song_url: chapter.song_url,
      date_start: chapter.date_start,
      date_end: chapter.date_end,
    }});
    setSaving(false);
  }

  async function onAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim()) return;
    await addP({ data: {
      chapter_id: id, image_url: newUrl.trim(),
      title: newTitle || undefined, caption: newCaption || undefined,
      taken_at: newDate || null,
    }});
    setNewUrl(""); setNewTitle(""); setNewCaption(""); setNewDate("");
    await refresh();
  }

  async function onUpdatePhoto(p: any, patch: any) {
    await updP({ data: { id: p.id, ...patch } });
    await refresh();
  }

  async function onDeletePhoto(pid: string) {
    if (!confirm("Delete this photo?")) return;
    await delP({ data: { id: pid } });
    await refresh();
  }

  if (!chapter) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/admin" className="text-sm text-primary underline">← back</Link>

      <form onSubmit={onSaveChapter} className="paper rounded-xl p-6 mt-6 space-y-4">
        <h1 className="serif italic text-3xl">Chapter details</h1>
        <Field label="Title">
          <input value={chapter.title} onChange={(e) => setChapter({ ...chapter, title: e.target.value })} className="input" />
        </Field>
        <Field label="Description">
          <textarea rows={3} value={chapter.description ?? ""} onChange={(e) => setChapter({ ...chapter, description: e.target.value })} className="input" />
        </Field>
        <Field label="Cover image URL">
          <input value={chapter.cover_url ?? ""} onChange={(e) => setChapter({ ...chapter, cover_url: e.target.value })} className="input" />
        </Field>
        <Field label="Song URL (mp3 direct link, optional)">
          <input value={chapter.song_url ?? ""} onChange={(e) => setChapter({ ...chapter, song_url: e.target.value })} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date start"><input type="date" value={chapter.date_start ?? ""} onChange={(e) => setChapter({ ...chapter, date_start: e.target.value || null })} className="input" /></Field>
          <Field label="Date end"><input type="date" value={chapter.date_end ?? ""} onChange={(e) => setChapter({ ...chapter, date_end: e.target.value || null })} className="input" /></Field>
        </div>
        <button disabled={saving} className="rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wide">
          {saving ? "Saving…" : "Save chapter"}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="serif italic text-2xl mb-4">Photos</h2>

        <form onSubmit={onAddPhoto} className="paper rounded-xl p-5 space-y-3 mb-6">
          <Field label="Image URL">
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://…" className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title"><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input" /></Field>
            <Field label="Date"><input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input" /></Field>
          </div>
          <Field label="Caption / story">
            <textarea rows={2} value={newCaption} onChange={(e) => setNewCaption(e.target.value)} className="input" />
          </Field>
          <button className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm uppercase tracking-wide">Add photo</button>
        </form>

        <div className="space-y-4">
          {photos.map((p) => (
            <div key={p.id} className="paper rounded-xl p-4 flex gap-4">
              <img src={p.image_url} alt="" className="w-28 h-28 rounded-md object-cover shrink-0" />
              <div className="flex-1 space-y-2">
                <input defaultValue={p.title ?? ""} placeholder="Title" onBlur={(e) => onUpdatePhoto(p, { title: e.target.value })} className="input" />
                <input type="date" defaultValue={p.taken_at ?? ""} onBlur={(e) => onUpdatePhoto(p, { taken_at: e.target.value || null })} className="input" />
                <textarea defaultValue={p.caption ?? ""} placeholder="Caption" rows={2} onBlur={(e) => onUpdatePhoto(p, { caption: e.target.value })} className="input" />
                <div className="text-right">
                  <button onClick={() => onDeletePhoto(p.id)} className="text-xs text-destructive">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {photos.length === 0 && <p className="text-center text-muted-foreground text-sm">No photos yet.</p>}
        </div>
      </div>

      <style>{`.input{width:100%;background:transparent;border:1px solid var(--input);border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;border-color:var(--primary)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
