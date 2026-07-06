import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  const password = process.env.SESSION_SECRET;
  if (!password) throw new Error("SESSION_SECRET is not set");
  return {
    password,
    name: "album-gate",
    maxAge: 60 * 60 * 24 * 60,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

async function requireUnlocked() {
  const session = await useSession<GateSession>(sessionConfig());
  if (!session.data.unlocked) {
    throw new Error("locked");
  }
}

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listChapters = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("id, title, slug, description, cover_url, song_url, date_start, date_end, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getChapter = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    const supabase = publicClient();
    const { data: chapter, error: cErr } = await supabase
      .from("chapters")
      .select("id, title, slug, description, cover_url, song_url, date_start, date_end")
      .eq("slug", data.slug)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!chapter) throw new Error("not_found");
    const { data: photos, error: pErr } = await supabase
      .from("photos")
      .select("id, image_url, title, caption, taken_at, sort_order, is_favorite")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: true });
    if (pErr) throw new Error(pErr.message);
    return { chapter, photos: photos ?? [] };
  });

export const listTimeline = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, image_url, title, caption, taken_at, chapter_id, is_favorite, chapters:chapter_id ( title, slug )")
    .order("taken_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listFavorites = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, image_url, title, caption, taken_at, chapter_id, chapters:chapter_id ( title, slug )")
    .eq("is_favorite", true)
    .order("taken_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getFavoritePhotos = createServerFn({ method: "POST" })
  .inputValidator((data: { photo_ids: string[] }) => data)
  .handler(async ({ data }) => {
    await requireUnlocked();
    if (data.photo_ids.length === 0) return [];
    const supabase = publicClient();
    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, image_url, title, caption, taken_at, chapter_id, chapters:chapter_id ( title, slug )")
      .in("id", data.photo_ids)
      .order("taken_at", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return photos ?? [];
  });

