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
  name: "list_timeline_photos",
  title: "List timeline photos",
  description:
    "List every photo in the album in chronological order by taken_at, including title, caption, and parent chapter. Requires the album passcode.",
  inputSchema: {
    passcode: z.string().min(1).describe("Album passcode required to unlock the album."),
    limit: z
      .number()
      .int()
      .describe("Optional maximum number of photos to return. Leave unset for all.")
      .optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ passcode, limit }) => {
    if (!verifyPasscode(passcode)) {
      return { content: [{ type: "text", text: "Invalid passcode." }], isError: true };
    }
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let query = supabase
      .from("photos")
      .select("id, image_url, title, caption, taken_at, chapters:chapter_id ( title, slug )")
      .order("taken_at", { ascending: true, nullsFirst: false });
    if (typeof limit === "number" && limit > 0) query = query.limit(Math.min(limit, 500));
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { photos: data ?? [] },
    };
  },
});
