import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export default defineTool({
  name: "get_chapter",
  title: "Get a chapter",
  description:
    "Fetch a chapter by its slug, including all of its photos in display order.",
  inputSchema: {
    slug: z.string().trim().min(1).describe("Chapter slug, e.g. 'first-trip'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("id, title, slug, description, cover_url, song_url, date_start, date_end, created_by")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!chapter) return { content: [{ type: "text", text: `No chapter with slug "${slug}"` }], isError: true };
    let creator_name: string | null = null;
    if (chapter.created_by) {
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", chapter.created_by).maybeSingle();
      creator_name = prof?.display_name ?? null;
    }
    const { data: photos } = await supabase
      .from("photos")
      .select("id, image_url, title, caption, taken_at, sort_order, is_favorite")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: true });
    const result = { chapter: { ...chapter, creator_name }, photos: photos ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
