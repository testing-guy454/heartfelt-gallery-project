import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
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
  adminGetChapter,
  updateChapter,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  reorderPhotos,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/chapters/$id")({
  component: EditChapter,
});

type Photo = {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  taken_at: string | null;
  sort_order: number;
  is_favorite: boolean;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function EditChapter() {
  const { id } = Route.useParams();
  const load = useServerFn(adminGetChapter);
  const saveChapter = useServerFn(updateChapter);
  const upload = useServerFn(uploadPhoto);
  const updP = useServerFn(updatePhoto);
  const delP = useServerFn(deletePhoto);
  const reorder = useServerFn(reorderPhotos);

  const [chapter, setChapter] = useState<any | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function refresh() {
    const r = await load({ data: { id } });
    setChapter(r.chapter);
    setPhotos(r.photos as Photo[]);
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

  async function handleFiles(fileList: FileList | File[]) {
    setUploadError(null);
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setUploadError("Please choose image files.");
      return;
    }
    setUploading(files.length);
    try {
      for (const file of files) {
        if (file.size > MAX_UPLOAD_BYTES) {
          setUploadError(`"${file.name}" is over 10 MB — skipped.`);
          setUploading((n) => n - 1);
          continue;
        }
        const b64 = await fileToBase64(file);
        await upload({ data: {
          chapter_id: id,
          filename: file.name,
          content_type: file.type || "image/jpeg",
          data_base64: b64,
        }});
        setUploading((n) => n - 1);
      }
    } catch (err: any) {
      setUploadError(err?.message ?? "Upload failed");
    } finally {
      setUploading(0);
      await refresh();
    }
  }

  async function onUpdatePhoto(p: Photo, patch: Partial<Photo>) {
    await updP({ data: { id: p.id, ...patch } as any });
    await refresh();
  }

  async function onDeletePhoto(pid: string) {
    if (!confirm("Delete this photo?")) return;
    await delP({ data: { id: pid } });
    await refresh();
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(photos, oldIndex, newIndex);
    setPhotos(next); // optimistic
    await reorder({ data: { chapter_id: id, photo_ids: next.map((p) => p.id) } });
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

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={`paper rounded-xl p-6 mb-6 border-2 border-dashed transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Drag & drop image files here, or
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm uppercase tracking-wide"
              disabled={uploading > 0}
            >
              {uploading > 0 ? `Uploading… (${uploading} left)` : "Choose photos"}
            </button>
            <p className="text-xs text-muted-foreground">JPG / PNG / WEBP, up to 10 MB each.</p>
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3">Drag the ⋮⋮ handle to reorder.</p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {photos.map((p) => (
                <SortablePhotoRow
                  key={p.id}
                  photo={p}
                  onUpdate={(patch) => onUpdatePhoto(p, patch)}
                  onDelete={() => onDeletePhoto(p.id)}
                />
              ))}
              {photos.length === 0 && (
                <p className="text-center text-muted-foreground text-sm">No photos yet — upload some above.</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <style>{`.input{width:100%;background:transparent;border:1px solid var(--input);border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem}.input:focus{outline:none;border-color:var(--primary)}`}</style>
    </div>
  );
}

function SortablePhotoRow({
  photo,
  onUpdate,
  onDelete,
}: {
  photo: Photo;
  onUpdate: (patch: Partial<Photo>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="paper rounded-xl p-4 flex gap-4 items-start">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground px-2 py-1 select-none"
        title="Drag to reorder"
      >
        ⋮⋮
      </button>
      <img src={photo.image_url} alt="" className="w-28 h-28 rounded-md object-cover shrink-0" />
      <div className="flex-1 space-y-2">
        <input defaultValue={photo.title ?? ""} placeholder="Title" onBlur={(e) => onUpdate({ title: e.target.value })} className="input" />
        <input type="date" defaultValue={photo.taken_at ?? ""} onBlur={(e) => onUpdate({ taken_at: e.target.value || null })} className="input" />
        <textarea defaultValue={photo.caption ?? ""} placeholder="Caption" rows={2} onBlur={(e) => onUpdate({ caption: e.target.value })} className="input" />
        <div className="text-right">
          <button onClick={onDelete} className="text-xs text-destructive">Delete</button>
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
