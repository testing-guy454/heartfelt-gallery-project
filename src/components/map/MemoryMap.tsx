import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet-vintage.css";
import type { MapChapter } from "@/lib/map.functions";
import { markerSVG, tiltForId, variantForId } from "./MemoryMarker";
import { MemoryPreview } from "./MemoryPreview";
import { CompassRose } from "./VintageMapControls";
import { useIsMobile } from "@/hooks/use-mobile";

type Filter = { kind: "all" } | { kind: "year"; year: number } | { kind: "chapter"; id: string } | { kind: "favorites" };

export function MemoryMap({ chapters }: { chapters: MapChapter[] }) {
  const isMobile = useIsMobile();
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [selected, setSelected] = useState<MapChapter | null>(null);
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [ready, setReady] = useState(false);

  const years = useMemo(() => {
    const s = new Set<number>();
    for (const c of chapters) {
      const d = c.date_start ?? c.date_end;
      if (d) s.add(new Date(d).getFullYear());
    }
    return [...s].sort((a, b) => a - b);
  }, [chapters]);

  const filtered = useMemo(() => {
    switch (filter.kind) {
      case "all":
        return chapters;
      case "year":
        return chapters.filter((c) => {
          const d = c.date_start ?? c.date_end;
          return d ? new Date(d).getFullYear() === filter.year : false;
        });
      case "chapter":
        return chapters.filter((c) => c.id === filter.id);
      case "favorites":
        return chapters; // no per-chapter favorite flag yet; placeholder to keep tab structure
    }
  }, [chapters, filter]);

  // Init leaflet once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const Lmod = await import("leaflet");
      const L: any = (Lmod as any).default ?? Lmod;
      // markercluster reads from window.L, so expose it before importing
      (window as any).L = L;
      await import("leaflet.markercluster");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
      if (cancelled || !mapEl.current) return;

      const map = L.map(mapEl.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        worldCopyJump: true,
      }).setView([20, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = { map, L };
      setReady(true);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current?.map) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render markers when filter/chapters change
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const { map, L } = mapRef.current;
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (filtered.length === 0) return;

    const cluster = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      iconCreateFunction: (c: any) => {
        const n = c.getChildCount();
        return L.divIcon({
          className: "memory-cluster",
          html: `<div class="memory-cluster-inner"><span style="color:#c24560">❤</span> ${n} ${n === 1 ? "Memory" : "Memories"}</div>`,
          iconSize: [110, 34],
          iconAnchor: [55, 17],
        });
      },
    });

    for (const c of filtered) {
      const variant = variantForId(c.id);
      const tilt = tiltForId(c.id);
      const icon = L.divIcon({
        className: "memory-marker",
        html: markerSVG(variant, tilt),
        iconSize: [34, 34],
        iconAnchor: [17, variant === "pin" ? 32 : 17],
      });
      const m = L.marker([c.latitude, c.longitude], {
        icon,
        title: `${c.title}${c.location_name ? ` — ${c.location_name}` : ""}`,
        keyboard: true,
        alt: `${c.title}${c.location_name ? `, ${c.location_name}` : ""}`,
      });
      m.on("click", () => setSelected(c));
      m.on("keypress", (e: any) => { if (e.originalEvent?.key === "Enter") setSelected(c); });
      cluster.addLayer(m);
    }

    map.addLayer(cluster);
    layerRef.current = cluster;

    // Fit bounds gently
    const bounds = L.latLngBounds(filtered.map((c) => [c.latitude, c.longitude] as [number, number]));
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.35), { animate: true, maxZoom: 8 });
  }, [ready, filtered]);

  if (chapters.length === 0) return <EmptyState />;

  return (
    <div className="relative vintage-map">
      {/* Filter tabs — paper */}
      <div role="tablist" aria-label="Filter memories" className="mb-4 flex flex-wrap items-end gap-2">
        <PaperTab active={filter.kind === "all"} onClick={() => setFilter({ kind: "all" })}>All memories</PaperTab>
        {years.map((y) => (
          <PaperTab
            key={y}
            active={filter.kind === "year" && filter.year === y}
            onClick={() => setFilter({ kind: "year", year: y })}
          >
            {y}
          </PaperTab>
        ))}
        <details className="relative">
          <summary
            className="list-none cursor-pointer serif italic text-[15px] px-3 py-1.5 border border-[color:var(--sepia)]/40"
            style={{ background: "color-mix(in oklab, var(--letter-paper) 85%, transparent)", clipPath: "polygon(4% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12%)" }}
          >
            {filter.kind === "chapter" ? chapters.find(c => c.id === filter.id)?.title ?? "Chapter" : "By chapter ▾"}
          </summary>
          <div className="absolute z-10 mt-2 max-h-64 overflow-auto min-w-[220px] paper rounded-sm p-2">
            {chapters.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter({ kind: "chapter", id: c.id })}
                className="block w-full text-left px-2 py-1 serif italic text-[15px] text-ink hover:bg-[color:var(--blush)]/40 rounded-sm"
              >
                {c.title}
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* Framed map */}
      <div
        className="relative aged-paper stitched rounded-sm p-3"
        style={{ boxShadow: "0 30px 60px -30px rgba(80,40,30,0.55)" }}
      >
        <div
          ref={mapEl}
          className="w-full"
          style={{ height: isMobile ? 460 : 620, borderRadius: 2, overflow: "hidden" }}
          aria-label="Map of memories"
          role="application"
        />
        <CompassRose className="pointer-events-none absolute top-6 left-6 w-20 h-20 opacity-80" />

        {selected && (
          <MemoryPreview
            chapter={selected}
            onClose={() => setSelected(null)}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}

function PaperTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="serif italic text-[15px] px-3 py-1.5 transition"
      style={{
        background: active
          ? "color-mix(in oklab, var(--blush) 55%, var(--letter-paper))"
          : "color-mix(in oklab, var(--letter-paper) 85%, transparent)",
        color: active ? "var(--rose-deep)" : "var(--ink)",
        border: "1px solid color-mix(in oklab, var(--sepia) 40%, transparent)",
        boxShadow: active ? "inset 0 -3px 0 color-mix(in oklab, var(--rose-deep) 55%, transparent)" : "none",
        clipPath: "polygon(4% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12%)",
        transform: active ? "translateY(-2px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="paper rounded-sm aged-paper stitched p-12 text-center max-w-xl mx-auto">
      <div className="mx-auto mb-6 w-24 h-24 opacity-70">
        <CompassRose className="w-full h-full" />
      </div>
      <p className="hand text-3xl text-[color:var(--pink-vivid)] leading-snug">
        No memories have found their place yet.
      </p>
      <p className="serif italic text-ink/70 mt-3">
        Open a chapter, pin its location, and it will bloom on the map.
      </p>
      <a
        href="/my/chapters"
        className="mt-6 inline-block btn-love"
      >
        Choose a chapter →
      </a>
    </div>
  );
}
