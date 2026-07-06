import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  adminListChapters,
  createChapter,
  deleteChapter,
  reorderChapters,
} from "@/lib/admin.functions";

import { requireAdminOrRedirect } from "@/lib/role-guard";

export const Route = createFileRoute("/_authenticated/admin/chapters/")({
  beforeLoad: async () => { await requireAdminOrRedirect(); },
  component: ChaptersManager,
});

type Chapter = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  sort_order: number;
};

function ChaptersManager() {
  const list = useServerFn(adminListChapters);
  const create = useServerFn(createChapter);
  const remove = useServerFn(deleteChapter);
  const reorder = useServerFn(reorderChapters);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBusy(true);
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

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(chapters, oldIndex, newIndex);
    setChapters(next);
    await reorder({ data: { chapter_ids: next.map((c) => c.id) } });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin" className="text-sm text-primary underline">← back</Link>
          <h1 className="serif italic text-4xl mt-2">Chapters</h1>
          <p className="text-sm text-muted-foreground">Create chapters and drag to set gallery order.</p>
        </div>
        <Link to="/album" className="text-sm text-primary underline">View album</Link>
      </div>

      <form onSubmit={onCreate} className="paper rounded-xl p-5 space-y-3 mb-8">
        <h2 className="serif italic text-xl">New chapter</h2>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
        />
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:border-primary"
        />
        <button
          disabled={busy || !newTitle.trim()}
          className="rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm uppercase tracking-wide disabled:opacity-50"
        >
          {busy ? "Creating…" : "Add chapter"}
        </button>
      </form>

      <p className="text-xs text-muted-foreground mb-3">Drag the ⋮⋮ handle to change order in the album.</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {chapters.map((c, i) => (
              <SortableChapterRow key={c.id} chapter={c} index={i + 1} onDelete={() => onDelete(c.id)} />
            ))}
            {chapters.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">No chapters yet.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {err && <p className="text-destructive text-sm mt-6">{err}</p>}
    </div>
  );
}

function SortableChapterRow({
  chapter,
  index,
  onDelete,
}: {
  chapter: Chapter;
  index: number;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="paper rounded-xl p-4 flex items-center gap-4">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground px-2 select-none"
      >
        ⋮⋮
      </button>
      <div className="text-xs text-muted-foreground w-6 text-right">{index}</div>
      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
        {chapter.cover_url && <img src={chapter.cover_url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="serif italic text-lg truncate">{chapter.title}</h3>
        <p className="text-xs text-muted-foreground">/{chapter.slug}</p>
      </div>
      <Link to="/admin/chapters/$id" params={{ id: chapter.id }} className="text-sm text-primary underline">
        Edit
      </Link>
      <button onClick={onDelete} className="text-sm text-destructive">Delete</button>
    </div>
  );
}
