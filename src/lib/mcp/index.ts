import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listChapters from "./tools/list-chapters";
import getChapter from "./tools/get-chapter";
import listTimeline from "./tools/list-timeline";
import listFavorites from "./tools/list-favorites";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "our-album-mcp",
  title: "Our Album",
  version: "0.1.0",
  instructions:
    "Read-only access to the private album: browse chapters, fetch a chapter with its photos, walk the full timeline, or list favorite photos.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listChapters, getChapter, listTimeline, listFavorites],
});
