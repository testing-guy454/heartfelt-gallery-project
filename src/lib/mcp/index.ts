import { defineMcp } from "@lovable.dev/mcp-js";
import listChapters from "./tools/list-chapters";
import getChapter from "./tools/get-chapter";
import listTimeline from "./tools/list-timeline";

export default defineMcp({
  name: "our-album-mcp",
  title: "Our Album",
  version: "0.1.0",
  instructions:
    "Read-only access to a private photo album. Every tool requires the album passcode. Use `list_chapters` to see chapters, `get_chapter` to load one chapter with its photos, and `list_timeline_photos` for the full chronological photo stream.",
  tools: [listChapters, getChapter, listTimeline],
});
