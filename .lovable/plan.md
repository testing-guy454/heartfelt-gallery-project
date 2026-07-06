# Memory Map

A new `/map` page that lets you and Her revisit chapters by the place they happened, styled like an unfolded hand-drawn map inside the scrapbook.

## Scope

1. **Schema** — add optional `location_name`, `latitude`, `longitude` to `chapters`. Existing chapters keep working.
2. **Admin editor** — add a "Memory Location" section in the chapter editor with search (OpenStreetMap Nominatim, no key needed), auto-filled lat/lng, and a "Pick on Map" mini-picker.
3. **Public `/map` page** — vintage Leaflet map with handcrafted markers, cluster badges ("❤ 5 Memories"), scrapbook preview card, filters as paper tabs, empty state, mobile slide-up preview.
4. **Nav** — add a "Memory Map" entry in `GateNav` with a compass-rose icon.
5. **Lazy loading** — Leaflet + CSS loaded only on `/map` via dynamic import; map bundle excluded from other routes.

## Visual direction

- Aged parchment tile overlay (CSS filter: sepia + soft blur + noise texture) applied over OpenStreetMap tiles so it reads as a printed travel-journal map, not Google Maps.
- Markers: SVG wax seal / pressed flower / tiny heart, rotated slightly, with soft ink shadow. Cycled per chapter for variety.
- Cluster badge: torn-paper rectangle with handwritten font, heart glyph + count.
- Compass rose in the corner (decorative SVG), stitched border around the map frame, torn-edge mask on the container.
- Preview card: postcard-style, lifts on open with a gentle rotate + scale.

## Filters

Paper-tab row above the map: All · By Year · By Chapter · Favorites. "Trips" is skipped for now — no trip concept exists in the data model; can be added later once chapters can be grouped.

## Files

New:
- `src/components/map/MemoryMap.tsx` — client-only Leaflet container, filter tabs, empty state
- `src/components/map/MemoryMarker.tsx` — custom `L.divIcon` variants
- `src/components/map/MemoryPreview.tsx` — postcard preview + mobile bottom sheet
- `src/components/map/MemoryCluster.tsx` — cluster badge renderer
- `src/components/map/VintageMapControls.tsx` — compass rose + zoom controls
- `src/components/map/LocationPicker.tsx` — admin search + mini map (used in editor)
- `src/lib/map.functions.ts` — `listMapChapters` server fn (public, only chapters with coords)
- `src/routes/map.tsx` — public route, lazy loads MemoryMap via `React.lazy` + Suspense
- `src/styles/leaflet-vintage.css` — overrides + tile filter

Edited:
- `src/routes/_authenticated/chapters.$id.edit.tsx` — Memory Location section using `LocationPicker`
- `src/lib/admin.functions.ts` — extend `updateChapter` validator with the new fields
- `src/components/album/GateNav.tsx` — add Memory Map link
- migration for the three new columns

## Technical notes

- Leaflet + `leaflet.markercluster` installed via `bun add`. Both imported dynamically inside the `MemoryMap` component so the bundle only loads on `/map`.
- Nominatim search called from the client with a descriptive `User-Agent` via a small server fn (`geocodeSearch`) to keep referrer-based rate limits sane and hide the origin.
- Server fn `listMapChapters` uses the server publishable client (public read-only) — same pattern as existing public album fns — filtering `latitude is not null`.
- RLS: existing chapters SELECT policy already allows public read of published data; the new columns inherit that. No new policies needed.
- Grants: no new tables, so no new GRANTs.
- Accessibility: markers are `<button>` elements inside Leaflet `divIcon` with `aria-label="Chapter title, location name"`. Preview card is a focus-trapped dialog on desktop, sheet on mobile. Filter tabs are a `role="tablist"`.

## Out of scope (kept simple, ask later if wanted)

- "Trips" filter (needs a trips concept in the data model)
- Route lines between chapters
- Custom marker per-chapter selection in admin (auto-cycled for now)

Ready to implement on approval.