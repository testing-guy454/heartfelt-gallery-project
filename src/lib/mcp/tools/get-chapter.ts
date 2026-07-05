import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function verifyPasscode(input: string): boolean {
  const expected = process.env.ALBUM_PASSCODE;
  if (!expected) return false;
  return input === expected;
}

export default defineTool({
  name: "get_chapter",
  title: "Get a chapter with its photos",
  description:
    "Fetch one chapter by slug together with its photos (title, caption, taken_at, image URL). Requires the album passcode.",
  inputSchema: {
    passcode: z.string().min(1).describe("Album passcode required to unlock the album."),
    slug: z.string().min(1).describe("Chapter slug, e.g. 'first-coffee'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ passcode, slug }) => {
    if (!verifyPasscode(passcode)) {
      return { content: [{ type: "text", text: "Invalid passcode." }], isError: true };
    }
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: chapter, error: cErr } = await supabase
      .from("chapters")
      .select("id, title, slug, description, cover_url, song_url, date_start, date_end")
      .eq("slug", slug)
      .maybeSingle();
    if (cErr) return { content: [{ type: "text", text: cErr.message }], isError: true };
    if (!chapter) return { content: [{ type: "text", text: `No chapter with slug "${slug}"` }], isError: true };

    const { data: photos, error: pErr } = await supabase
      .from("photos")
      .select("id, image_url, title, caption, taken_at, sort_order")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: true });
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };

    const payload = { chapter, photos: photos ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
