import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export default defineTool({
  name: "list_chapters",
  title: "List album chapters",
  description:
    "List every chapter in the album (title, slug, description, date range, cover image, creator).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("chapters")
      .select("id, title, slug, description, cover_url, date_start, date_end, sort_order, created_by")
      .order("sort_order", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const ids = Array.from(new Set((data ?? []).map(r => r.created_by).filter((x): x is string => !!x)));
    const creators = new Map<string, string>();
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", ids);
      for (const p of profs ?? []) if (p.display_name) creators.set(p.id, p.display_name);
    }
    const rows = (data ?? []).map(r => ({
      ...r,
      creator_name: r.created_by ? (creators.get(r.created_by) ?? null) : null,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { chapters: rows },
    };
  },
});
