import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";
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

export type MapChapter = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  date_start: string | null;
  date_end: string | null;
  location_name: string | null;
  latitude: number;
  longitude: number;
};

export const listMapChapters = createServerFn({ method: "GET" }).handler(async () => {
  await requireUnlocked();
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("id, slug, title, description, cover_url, date_start, date_end, location_name, latitude, longitude")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("date_start", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MapChapter[];
});

export type GeocodeResult = {
  display_name: string;
  latitude: number;
  longitude: number;
};

// Uses OpenStreetMap Nominatim from the server so we control the UA.
export const geocodeSearch = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    const q = data.query.trim();
    if (q.length < 2) return [] as GeocodeResult[];
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "6");
    url.searchParams.set("addressdetails", "0");
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "OurAlbum-MemoryMap/1.0 (contact: hello@ouralbum.local)",
        "Accept-Language": "en",
      },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
    return rows.map((r) => ({
      display_name: r.display_name,
      latitude: Number(r.lat),
      longitude: Number(r.lon),
    })) satisfies GeocodeResult[];
  });
