
# Anniversary Timeline

A separate feature from chapters. Public read for unlocked visitors; keeper-only admin editor.

## 1. Data

New table `public.milestones` (Lovable Cloud):

| field | type | notes |
|---|---|---|
| id | uuid pk | |
| title | text | required |
| date | date | required |
| description | text | short story |
| handwritten_note | text | optional italic subtitle |
| cover_url | text | image in `album-photos` bucket |
| gallery_urls | text[] | optional extra photos |
| location_name | text | optional |
| latitude, longitude | numeric | optional (reuse map fns later) |
| music_url | text | optional |
| chapter_id | uuid → chapters.id | optional link |
| emoji | text | small motif (❤️, 🌸, ✈️…) |
| sort_order | int | for manual ordering |
| created_by | uuid | |
| created_at / updated_at | timestamptz | |

Plus a single-row settings table `public.relationship_settings` with `start_date`, so the anniversary counter and page hero can read one place.

RLS + GRANTs:
- `SELECT` on `milestones` / `relationship_settings` gated through the existing gate (server fn `requireUnlocked` + publishable server client). No public `anon` policy — read via server fn, same pattern as `listChapters`.
- Insert/update/delete restricted to `has_role(auth.uid(),'admin')`.

## 2. Server functions (`src/lib/anniversary.functions.ts`)

- `listMilestones()` — gated, returns milestones ordered by `date` asc (then `sort_order`), plus `relationship_settings.start_date`.
- `getMilestone(id)` — gated.
- `upsertMilestone(input)` — admin-only (`has_role` check).
- `deleteMilestone(id)` — admin-only.
- `reorderMilestones(ids: string[])` — admin-only, writes `sort_order`.
- `setRelationshipStart(date)` — admin-only.

All follow the existing pattern in `album.functions.ts` (`throw redirect({to:"/"})` when locked, `has_role` RPC for admin gate).

## 3. Routes

- `src/routes/anniversary.tsx` — public (behind album gate). Loader calls `listMilestones()`; on lock, redirects to `/`.
- `src/routes/_authenticated/admin/anniversary.tsx` — admin editor.

Head metadata per route (title/description/og distinct from chapters).

## 4. Components (`src/components/anniversary/`)

- `AnniversaryTimeline.tsx` — orchestrates counter → year dividers → milestones → connectors. Alternates left/right per index, adds ±1–2° rotations, IntersectionObserver-driven soft fade-up.
- `AnniversaryCounter.tsx` — reads `start_date`, computes Years / Months / Days live (updates once/min), stamp-style typography, quote below.
- `YearDivider.tsx` — hand-drawn ink line + handwritten year label + tiny sprig ornaments.
- `MilestoneCard.tsx` — layered aged-paper card with:
  - polaroid-style cover with photo corners
  - washi tape / wax seal / pressed-flower motif (deterministic pick from id so no two look identical)
  - hand-written subtitle, short story, "Read more" expander
  - "Related memory" pill → `Link to="/album/c/$slug"` when `chapter_id` is set
  - optional music player (small `<audio>`)
- `TimelineConnector.tsx` — SVG stitched/ribbon curve between two cards (curves toward next card's side).
- `StoryMode.tsx` — full-screen overlay, one milestone at a time, arrow-key + swipe nav, hides nav chrome, fade transitions.
- `MilestoneAdminEditor.tsx` — form + drag-and-drop list (use `@dnd-kit/sortable`, already installed if not I'll add), image upload via existing `album-photos` bucket helper, chapter picker `<select>`.

Motifs, tapes, wax seals, pressed flowers reuse the SVG primitives in `src/components/album/Ornaments.tsx`; I'll add 2–3 new ones (wax seal, pressed rose, stitched ribbon) there.

## 5. Nav

Append "Our Journey" (❤ heart-icon variant already in `Ornaments`) to `GateNav` between "Chapters" and "Map".

## 6. Interactions

- Scroll-triggered `animate-fade-in` per card via `IntersectionObserver` (no library).
- Cover images: subtle parallax via `transform: translateY(scrollY * 0.05)` in a rAF loop; disabled under `prefers-reduced-motion`.
- Story Mode: local component state, `Escape` to exit, ←/→ to page. No route change.

## 7. Accessibility

- `<ol>` for the timeline, `<li>` per milestone.
- Each card is a landmark region with `aria-labelledby` on the title.
- Focus-visible ring on all interactive elements (already themed).
- Counter marked `aria-live="polite"` (updates infrequent).
- Story Mode traps focus, restores on close.
- Parallax and rotations gated on `prefers-reduced-motion: reduce`.

## Technical details

- Migration: create `milestones` + `relationship_settings`, GRANTs to `authenticated` + `service_role` (no `anon`), RLS with `has_role` for writes, `updated_at` trigger via existing `set_updated_at()`.
- Server fns use publishable server client + `requireUnlocked` for reads; admin fns use `requireSupabaseAuth` + `has_role`.
- Storage: reuse `album-photos` bucket. Signed URLs via existing helper if present, otherwise add `getSignedPhotoUrl` server fn.
- Types regenerate after migration approval; then wire the fns and components.
- No new heavy deps; `@dnd-kit/core` + `@dnd-kit/sortable` added only if the admin drag-and-drop is confirmed (small, tree-shaken).

## Out of scope for this pass

- Public commenting / reactions on milestones.
- Sharing an individual milestone URL (can add `/anniversary/$id` later).
- Multi-user "our journey" (single relationship, matches the current gift-album framing).

## Build order

1. Migration (schema + policies + grants) — requires your approval.
2. Server fns + types.
3. Public `/anniversary` page + components.
4. Nav entry.
5. Admin editor at `/_authenticated/admin/anniversary`.
6. Story Mode polish + reduced-motion pass.
