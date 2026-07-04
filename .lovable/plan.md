# A Virtual Photo Album — Plan

A private, romantic photo album for your girlfriend, organized as **chapters** ("First Date", "Trips", "Little Everyday", etc.) with a secondary **timeline** view. Warm & elegant feel. Passcode-gated. You'll manage everything from a private admin page after signing in.

## What she'll see

- **Cover page** — her name, a dedication line, and a single "Open" button. Soft cream backdrop, elegant serif title, gentle fade-in.
- **Passcode gate** — she enters a shared passcode you give her. Once unlocked, it stays unlocked on her device.
- **Home** — hero note from you, then a grid of **chapter cards** (cover photo + title + short description + date range). Small toggle to switch to **Timeline view** (all memories in chronological order with month/year headers).
- **Chapter page** — chapter title, your written story/intro, then the photos. Each photo can have a title, date, and a longer caption/story underneath. Optional song for the chapter plays softly with a small floating player (mute/play control, never autoplay-loud).
- **Photo lightbox** — click any photo to view large with its caption; arrow-key navigation.

## What you'll see (admin)

- **/admin/login** — email + password sign-in (only your account works).
- **/admin** — dashboard listing chapters. Create / rename / reorder / delete chapters. Set cover photo, description, date range, and a song URL per chapter.
- **/admin/chapters/:id** — inside a chapter: upload photos (drag-and-drop, multi-file), reorder them, edit each photo's title / date / caption, delete.
- Expandable by design: adding a new chapter or photo is just a form — no code changes needed once built.

## Visual direction (Romantic & warm)

- Palette: warm cream `#FAF6EF` background, deep rose `#B24A5E` accent, soft blush `#F3D9DA` surfaces, ink `#2A1F1F` text, muted gold `#C9A96A` details.
- Type: elegant serif for headings (Cormorant Garamond), clean sans for body (Inter), an italic handwritten accent for signatures/dates (Caveat).
- Motion: gentle fade + slight rise on scroll, soft image zoom on hover, page transitions cross-fade — nothing bouncy.
- Details: rounded corners, subtle paper-grain background, thin gold divider between sections, small pressed-flower/heart flourishes used sparingly.

## Development-period sample content

Three seeded chapters with 4–6 stock romantic photos each and placeholder captions ("Add your story here…") so the whole flow is browsable immediately. You'll replace them from the admin later — the sample images live only in the seed and can be deleted per photo.

---

## Technical section

**Stack:** TanStack Start (already scaffolded) + Lovable Cloud (Supabase) for auth, database, and image storage. Tailwind v4 tokens defined in `src/styles.css`; shadcn components for forms/dialogs.

**Auth:**
- Email/password only. You are the sole admin — enforced via a `user_roles` table + `has_role()` security-definer function (never store role on profile).
- **Shared passcode gate** for the album itself: server-only `ALBUM_PASSCODE` env var, verified in a `createServerFn` with timing-safe compare, unlocked flag stored in an encrypted `useSession` cookie (`SESSION_SECRET`). No per-visitor accounts.

**Data model (Supabase):**
- `chapters` — id, title, slug, description, cover_photo_id (nullable), song_url (nullable), date_start, date_end, sort_order, created_at.
- `photos` — id, chapter_id (fk), storage_path, title, caption, taken_at, sort_order, created_at.
- `user_roles` — (user_id, role enum `admin`) with `has_role()` SECURITY DEFINER.
- Storage bucket `album-photos` (private). Signed URLs generated server-side for viewing.
- RLS: `chapters` and `photos` — public SELECT gated by the shared passcode (reads go through a `createServerFn` that first checks the unlocked session, then queries with the server publishable client). All writes require `has_role(auth.uid(), 'admin')`. Explicit GRANTs for `authenticated` and `service_role`; `anon` gets no direct table access (server fn mediates).

**Routes:**
- `/` — cover / dedication
- `/unlock` — passcode form
- `/album` — chapters grid (gated)
- `/album/timeline` — chronological view (gated)
- `/album/c/$slug` — chapter page (gated)
- `/auth` — admin login (public)
- `/_authenticated/admin` — dashboard
- `/_authenticated/admin/chapters/$id` — chapter editor

**Server functions (`src/lib/*.functions.ts`):**
- `unlockAlbum({ passcode })`, `lockAlbum()`
- `listChapters()`, `getChapter(slug)`, `listTimeline()` — all gated on unlocked session
- Admin fns behind `requireSupabaseAuth` + admin role check: `createChapter`, `updateChapter`, `deleteChapter`, `reorderChapters`, `uploadPhoto` (returns signed upload URL), `updatePhoto`, `deletePhoto`, `reorderPhotos`, `setChapterCover`.

**Secrets to add:** `ALBUM_PASSCODE`, `SESSION_SECRET` (32+ chars, auto-generated).

**Seed data:** migration inserts 3 sample chapters with Unsplash-style placeholder image URLs so the UI is populated during development.

**Fonts:** loaded via `<link>` tags in `src/routes/__root.tsx` head (Cormorant Garamond, Inter, Caveat), referenced via `--font-*` tokens in `styles.css`.

## Out of scope (say the word to add later)

- Guest comments / reactions
- Video support
- Downloadable PDF album export
- Multiple viewers with individual accounts
- Sharing individual photos via link

---

Approve and I'll build it end-to-end with the sample content so you can click through immediately, then you can sign in and start replacing photos.
