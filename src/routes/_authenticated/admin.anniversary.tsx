import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  adminListMilestones,
  upsertMilestone,
  deleteMilestone,
  reorderMilestones,
  setRelationshipSettings,
  uploadMilestonePhoto,
  listChaptersForPicker,
} from "@/lib/anniversary.functions";
import { requireAdminOrRedirect } from "@/lib/role-guard";

export const Route = createFileRoute("/_authenticated/admin/anniversary")({
  beforeLoad: async () => {
    await requireAdminOrRedirect();
  },
  component: AdminAnniversary,
});

type Row = {
  id: string;
  title: string;
  date: string;
  emoji: string | null;
  chapter_id: string | null;
  cover_url: string | null;
  handwritten_note: string | null;
  description: string | null;
  location_name: string | null;
  music_url: string | null;
  gallery_urls: string[];
  sort_order: number;
};

function AdminAnniversary() {
  const load = useServerFn(adminListMilestones);
  const save = useServerFn(upsertMilestone);
  const remove = useServerFn(deleteMilestone);
  const reorder = useServerFn(reorderMilestones);
  const saveSettings = useServerFn(setRelationshipSettings);
  const upload = useServerFn(uploadMilestonePhoto);
  const listChapters = useServerFn(listChaptersForPicker);

  const [rows, setRows] = useState<Row[]>([]);
  const [chapters, setChapters] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function refresh() {
    const r = await load();
    setRows((r.milestones as any[]).map((m) => ({ ...m, gallery_urls: m.gallery_urls ?? [] })) as Row[]);
    setStartDate(r.settings?.start_date ?? "");
    setTagline(r.settings?.tagline ?? "");
  }

  useEffect(() => {
    refresh().catch((e) => setErr(String(e.message ?? e)));
    listChapters().then(setChapters).catch(() => {});
  }, []);

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = rows.findIndex((r) => r.id === active.id);
    const newIdx = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, oldIdx, newIdx);
    setRows(next);
    try {
      await reorder({ data: { ids: next.map((r) => r.id) } });
    } catch (e: any) {
      setErr(e.message);
      refresh();
    }
  }

  async function onSaveEditing() {
    if (!editing?.title || !editing?.date) {
      setErr("Title and date are required.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await save({
        data: {
          id: editing.id,
          title: editing.title,
          date: editing.date,
          description: editing.description ?? null,
          handwritten_note: editing.handwritten_note ?? null,
          cover_url: editing.cover_url ?? null,
          gallery_urls: editing.gallery_urls ?? [],
          location_name: editing.location_name ?? null,
          music_url: editing.music_url ?? null,
          chapter_id: editing.chapter_id ?? null,
          emoji: editing.emoji ?? null,
        },
      });
      setEditing(null);
      await refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(file: File, kind: "cover" | "gallery") {
    const buf = await file.arrayBuffer();
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin);
    const r = await upload({
      data: {
        filename: file.name,
        content_type: file.type || "image/jpeg",
        data_base64: b64,
        kind,
      },
    });
    if (kind === "cover") {
      setEditing((e) => ({ ...(e ?? {}), cover_url: r.url }));
    } else {
      setEditing((e) => ({
        ...(e ?? {}),
        gallery_urls: [...(e?.gallery_urls ?? []), r.url],
      }));
    }
  }

  async function onSaveSettings() {
    setBusy(true);
    try {
      await saveSettings({
        data: { start_date: startDate || null, tagline: tagline || null },
      });
      await refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="serif italic text-4xl text-ink">Anniversary Timeline</h1>
          <p className="text-muted-foreground italic">Manage the milestones that tell your love story.</p>
        </div>
        <Link to="/admin" className="stamp-font text-[10px] tracking-[0.34em] uppercase text-[color:var(--rose-deep)] hover:opacity-80">
          ← back to admin
        </Link>
      </header>

      {err && <div className="mb-4 p-3 border border-destructive/40 text-destructive text-sm">{err}</div>}

      {/* Settings */}
      <section className="mb-8 p-5 aged-paper stitched rounded-sm">
        <h2 className="serif italic text-2xl text-ink mb-3">Relationship settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-xs italic text-muted-foreground">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-[color:var(--sepia)]/40 py-2 font-serif italic text-lg"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs italic text-muted-foreground">Tagline</span>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Every day has become another beautiful memory."
              className="mt-1 w-full bg-transparent border-b border-[color:var(--sepia)]/40 py-2 font-serif italic text-lg"
            />
          </label>
        </div>
        <button
          onClick={onSaveSettings}
          disabled={busy}
          className="mt-4 px-5 py-2 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[10px] tracking-[0.34em] uppercase disabled:opacity-50"
        >
          save settings
        </button>
      </section>

      {/* Milestones list */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="serif italic text-2xl text-ink">Milestones</h2>
          <button
            onClick={() =>
              setEditing({
                title: "",
                date: new Date().toISOString().slice(0, 10),
                gallery_urls: [],
              })
            }
            className="px-4 py-2 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[10px] tracking-[0.34em] uppercase"
          >
            + new milestone
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {rows.map((r) => (
                <SortableRow
                  key={r.id}
                  row={r}
                  onEdit={() => setEditing(r)}
                  onDelete={async () => {
                    if (!confirm(`Delete "${r.title}"?`)) return;
                    await remove({ data: { id: r.id } });
                    await refresh();
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {rows.length === 0 && (
          <p className="text-center italic text-muted-foreground py-8">No milestones yet.</p>
        )}
      </section>

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div
            className="bg-[color:var(--letter-paper)] max-w-2xl w-full max-h-[90vh] overflow-auto p-6 rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="serif italic text-2xl text-ink mb-4">
              {editing.id ? "Edit milestone" : "New milestone"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Emoji" value={editing.emoji ?? ""} onChange={(v) => setEditing({ ...editing, emoji: v })} placeholder="❤️" />
              <Field label="Title *" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Date *" type="date" value={editing.date ?? ""} onChange={(v) => setEditing({ ...editing, date: v })} />
              <Field label="Location" value={editing.location_name ?? ""} onChange={(v) => setEditing({ ...editing, location_name: v })} />
              <Field label="Handwritten subtitle" value={editing.handwritten_note ?? ""} onChange={(v) => setEditing({ ...editing, handwritten_note: v })} />
              <Field label="Music URL" value={editing.music_url ?? ""} onChange={(v) => setEditing({ ...editing, music_url: v })} />
              <label className="block md:col-span-2">
                <span className="text-xs italic text-muted-foreground">Related chapter</span>
                <select
                  value={editing.chapter_id ?? ""}
                  onChange={(e) => setEditing({ ...editing, chapter_id: e.target.value || null })}
                  className="mt-1 w-full bg-transparent border-b border-[color:var(--sepia)]/40 py-2 font-serif italic text-lg"
                >
                  <option value="">— none —</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs italic text-muted-foreground">Description</span>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={5}
                  className="mt-1 w-full bg-transparent border border-[color:var(--sepia)]/40 py-2 px-2 font-serif italic"
                />
              </label>
              <div className="md:col-span-2">
                <span className="text-xs italic text-muted-foreground">Cover photo</span>
                {editing.cover_url && (
                  <img src={editing.cover_url} alt="" className="mt-2 h-32 object-cover rounded-sm" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block text-sm"
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "cover")}
                />
              </div>
              <div className="md:col-span-2">
                <span className="text-xs italic text-muted-foreground">Gallery</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editing.gallery_urls ?? []).map((u, i) => (
                    <div key={u + i} className="relative">
                      <img src={u} alt="" className="w-20 h-20 object-cover rounded-sm" />
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            gallery_urls: (editing.gallery_urls ?? []).filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full"
                      >×</button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block text-sm"
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "gallery")}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm italic text-muted-foreground hover:text-foreground"
              >cancel</button>
              <button
                onClick={onSaveEditing}
                disabled={busy}
                className="px-5 py-2 rounded-full bg-[color:var(--rose-deep)] text-[color:var(--primary-foreground)] text-[10px] tracking-[0.34em] uppercase disabled:opacity-50"
              >save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs italic text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border-b border-[color:var(--sepia)]/40 py-2 font-serif italic text-lg"
      />
    </label>
  );
}

function SortableRow({
  row, onEdit, onDelete,
}: {
  row: Row; onEdit: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="flex items-center gap-3 p-3 aged-paper stitched rounded-sm"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab text-muted-foreground px-2"
      >⋮⋮</button>
      {row.cover_url ? (
        <img src={row.cover_url} alt="" className="w-14 h-14 object-cover rounded-sm" />
      ) : (
        <div className="w-14 h-14 rounded-sm bg-[color:var(--sepia)]/15 flex items-center justify-center text-2xl">
          {row.emoji ?? "❤"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="serif italic text-lg text-ink truncate">
          {row.emoji ? row.emoji + " " : ""}{row.title}
        </div>
        <div className="text-xs text-muted-foreground italic">
          {row.date}{row.location_name ? ` · ${row.location_name}` : ""}
        </div>
      </div>
      <button onClick={onEdit} className="text-sm italic text-[color:var(--rose-deep)] hover:opacity-80">edit</button>
      <button onClick={onDelete} className="text-sm italic text-destructive hover:opacity-80">delete</button>
    </li>
  );
}
