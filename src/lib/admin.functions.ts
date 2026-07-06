import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function isAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  return !!data;
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  if (!(await isAdmin(context))) throw new Error("Forbidden: admin only");
}

async function assertCanManageChapter(
  context: { supabase: any; userId: string },
  chapterId: string,
) {
  if (await isAdmin(context)) return;
  const { data, error } = await context.supabase
    .from("chapters").select("created_by").eq("id", chapterId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.created_by !== context.userId) throw new Error("Forbidden");
}

async function assertCanManagePhoto(
  context: { supabase: any; userId: string },
  photoId: string,
) {
  if (await isAdmin(context)) return;
  const { data, error } = await context.supabase
    .from("photos").select("chapter_id, chapters:chapter_id(created_by)").eq("id", photoId).maybeSingle();
  if (error) throw new Error(error.message);
  const owner = (data as any)?.chapters?.created_by;
  if (!data || owner !== context.userId) throw new Error("Forbidden");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!data };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) return { ok: false as const, reason: "already_claimed" };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminListChapters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("chapters")
      .select("id, title, slug, description, cover_url, song_url, date_start, date_end, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetChapter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertCanManageChapter(context, data.id);
    const { data: chapter, error } = await context.supabase
      .from("chapters")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!chapter) throw new Error("Not found");
    const { data: photos, error: pErr } = await context.supabase
      .from("photos")
      .select("*")
      .eq("chapter_id", data.id)
      .order("sort_order", { ascending: true });
    if (pErr) throw new Error(pErr.message);
    return { chapter, photos: photos ?? [] };
  });

export const listMyChapters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chapters")
      .select("id, title, slug, description, cover_url, sort_order, created_by")
      .eq("created_by", context.userId)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });


function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "chapter";
}

export const createChapter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { title: string; description?: string }) => data)
  .handler(async ({ data, context }) => {
    // Any signed-in user can create a chapter; ownership is tracked in created_by.

    const base = slugify(data.title);
    let slug = base;
    let n = 1;
    while (true) {
      const { data: existing } = await context.supabase
        .from("chapters").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      n += 1; slug = `${base}-${n}`;
    }
    const { data: maxRow } = await context.supabase
      .from("chapters").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const next = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;
    const { data: created, error } = await context.supabase
      .from("chapters")
      .insert({
        title: data.title,
        slug,
        description: data.description ?? null,
        sort_order: next,
        created_by: context.userId,
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return created;
  });

export const updateChapter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id: string; title?: string; description?: string | null; cover_url?: string | null;
    song_url?: string | null; date_start?: string | null; date_end?: string | null;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertCanManageChapter(context, data.id);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("chapters").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteChapter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("chapters").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderChapters = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { chapter_ids: string[] }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const results = await Promise.all(
      data.chapter_ids.map((id, idx) =>
        context.supabase.from("chapters").update({ sort_order: idx + 1 }).eq("id", id),
      ),
    );
    for (const r of results) if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

export const addPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { chapter_id: string; image_url: string; title?: string; caption?: string; taken_at?: string | null }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: maxRow } = await context.supabase
      .from("photos").select("sort_order").eq("chapter_id", data.chapter_id)
      .order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const next = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;
    const { data: created, error } = await context.supabase
      .from("photos")
      .insert({
        chapter_id: data.chapter_id,
        image_url: data.image_url,
        title: data.title ?? null,
        caption: data.caption ?? null,
        taken_at: data.taken_at ?? null,
        sort_order: next,
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return created;
  });

export const updatePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; title?: string | null; caption?: string | null; taken_at?: string | null; image_url?: string; is_favorite?: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("photos").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("photos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { chapter_id: string; photo_ids: string[] }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const results = await Promise.all(
      data.photo_ids.map((id, idx) =>
        context.supabase
          .from("photos")
          .update({ sort_order: idx + 1 })
          .eq("id", id)
          .eq("chapter_id", data.chapter_id),
      ),
    );
    for (const r of results) if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // ~10 years

export const uploadPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    chapter_id: string;
    filename: string;
    content_type: string;
    data_base64: string;
    title?: string;
    caption?: string;
    taken_at?: string | null;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const bin = atob(data.data_base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const extMatch = data.filename.match(/\.([a-zA-Z0-9]+)$/);
    const ext = (extMatch?.[1] ?? "jpg").toLowerCase();
    const key = `chapters/${data.chapter_id}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("album-photos")
      .upload(key, bytes, { contentType: data.content_type, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("album-photos")
      .createSignedUrl(key, SIGNED_URL_TTL);
    if (sErr || !signed) throw new Error(sErr?.message ?? "sign_failed");

    const { data: maxRow } = await context.supabase
      .from("photos").select("sort_order").eq("chapter_id", data.chapter_id)
      .order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const next = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;

    const { data: created, error } = await context.supabase
      .from("photos")
      .insert({
        chapter_id: data.chapter_id,
        image_url: signed.signedUrl,
        title: data.title ?? null,
        caption: data.caption ?? null,
        taken_at: data.taken_at ?? null,
        sort_order: next,
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return created;
  });
