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
  name: "list_chapters",
  title: "List album chapters",
  description:
    "List all chapters of the private album (title, slug, dates, description). Requires the album passcode.",
  inputSchema: {
    passcode: z.string().min(1).describe("Album passcode required to unlock the album."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ passcode }) => {
    if (!verifyPasscode(passcode)) {
      return { content: [{ type: "text", text: "Invalid passcode." }], isError: true };
    }
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("chapters")
      .select("id, title, slug, description, date_start, date_end, sort_order")
      .order("sort_order", { ascending: true });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { chapters: data ?? [] },
    };
  },
});
