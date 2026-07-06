import { defineMcp } from "@lovable.dev/mcp-js";
import listChapters from "./tools/list-chapters";
import getChapter from "./tools/get-chapter";
import listTimeline from "./tools/list-timeline";
import listFavorites from "./tools/list-favorites";

export default defineMcp({
  name: "our-album-mcp",
  title: "Our Album",
  version: "0.1.0",
  instructions:
    "Read-only access to the private album: browse chapters, fetch a chapter with its photos, walk the full timeline, or list favorite photos.",
  tools: [listChapters, getChapter, listTimeline, listFavorites],
});
