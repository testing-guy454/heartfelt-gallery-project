import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  if (!session.data.unlocked) throw redirect({ to: "/" });
}

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden: admin only");
}

export type Milestone = {
  id: string;
  title: string;
  date: string;
  description: string | null;
  handwritten_note: string | null;
  cover_url: string | null;
  gallery_urls: string[];
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  music_url: string | null;
  chapter_id: string | null;
  chapter_slug: string | null;
  chapter_title: string | null;
  emoji: string | null;
  sort_order: number;
};

export type RelationshipSettings = {
  start_date: string | null;
  tagline: string | null;
};

// ---------- Public (gated) reads ----------

export const listMilestones = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const supabase = publicClient();

  const { data: ms, error } = await supabase
    .from("milestones")
    .select("id, title, date, description, handwritten_note, cover_url, gallery_urls, location_name, latitude, longitude, music_url, chapter_id, emoji, sort_order")
    .order("date", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const chapterIds = Array.from(
    new Set((ms ?? []).map((m) => m.chapter_id).filter((x): x is string => !!x)),
  );
  let chapterMap = new Map<string, { slug: string; title: string }>();
  if (chapterIds.length) {
    const { data: chs } = await supabase
      .from("chapters")
      .select("id, slug, title")
      .in("id", chapterIds);
    chapterMap = new Map((chs ?? []).map((c) => [c.id, { slug: c.slug, title: c.title }]));
  }

  const milestones: Milestone[] = (ms ?? []).map((m) => {
    const ch = m.chapter_id ? chapterMap.get(m.chapter_id) : undefined;
    return {
      id: m.id,
      title: m.title,
      date: m.date,
      description: m.description,
      handwritten_note: m.handwritten_note,
      cover_url: m.cover_url,
      gallery_urls: (m.gallery_urls ?? []) as string[],
      location_name: m.location_name,
      latitude: m.latitude !== null ? Number(m.latitude) : null,
      longitude: m.longitude !== null ? Number(m.longitude) : null,
      music_url: m.music_url,
      chapter_id: m.chapter_id,
      chapter_slug: ch?.slug ?? null,
      chapter_title: ch?.title ?? null,
      emoji: m.emoji,
      sort_order: m.sort_order,
    };
  });

  const { data: settings } = await supabase
    .from("relationship_settings")
    .select("start_date, tagline")
    .eq("id", true)
    .maybeSingle();

  const rs: RelationshipSettings = {
    start_date: settings?.start_date ?? null,
    tagline: settings?.tagline ?? null,
  };

  return { milestones, settings: rs };
});

// ---------- Admin ----------

export const adminListMilestones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("milestones")
      .select("*")
      .order("date", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    const { data: settings } = await context.supabase
      .from("relationship_settings")
      .select("start_date, tagline")
      .eq("id", true)
      .maybeSingle();
    return { milestones: data ?? [], settings: settings ?? { start_date: null, tagline: null } };
  });

export const upsertMilestone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    id?: string;
    title: string;
    date: string;
    description?: string | null;
    handwritten_note?: string | null;
    cover_url?: string | null;
    gallery_urls?: string[] | null;
    location_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    music_url?: string | null;
    chapter_id?: string | null;
    emoji?: string | null;
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await context.supabase
        .from("milestones").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, id };
    }
    const { data: maxRow } = await context.supabase
      .from("milestones").select("sort_order")
      .order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const next = ((maxRow?.sort_order as number | undefined) ?? 0) + 1;
    const { data: created, error } = await context.supabase
      .from("milestones")
      .insert({ ...data, sort_order: next, created_by: context.userId })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: created!.id as string };
  });

export const deleteMilestone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("milestones").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderMilestones = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ids: string[] }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const results = await Promise.all(
      data.ids.map((id, idx) =>
        context.supabase.from("milestones").update({ sort_order: idx + 1 }).eq("id", id),
      ),
    );
    for (const r of results) if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

export const setRelationshipSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { start_date?: string | null; tagline?: string | null }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("relationship_settings")
      .upsert({ id: true, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export const uploadMilestonePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    filename: string;
    content_type: string;
    data_base64: string;
    kind?: "cover" | "gallery";
  }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const bin = atob(data.data_base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const extMatch = data.filename.match(/\.([a-zA-Z0-9]+)$/);
    const ext = (extMatch?.[1] ?? "jpg").toLowerCase();
    const key = `milestones/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("album-photos")
      .upload(key, bytes, { contentType: data.content_type, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("album-photos")
      .createSignedUrl(key, SIGNED_URL_TTL);
    if (sErr || !signed) throw new Error(sErr?.message ?? "sign_failed");

    return { url: signed.signedUrl };
  });

export const listChaptersForPicker = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("chapters").select("id, title, slug").order("title", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
