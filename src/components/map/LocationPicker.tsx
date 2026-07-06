import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet-vintage.css";
import { useServerFn } from "@tanstack/react-start";
import { geocodeSearch, type GeocodeResult } from "@/lib/map.functions";

type Value = { location_name: string | null; latitude: number | null; longitude: number | null };

export function LocationPicker({
  value,
  onChange,
}: {
  value: Value;
  onChange: (v: Value) => void;
}) {
  const search = useServerFn(geocodeSearch);
  const [query, setQuery] = useState(value.location_name ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  async function runSearch(q: string) {
    setSearching(true);
    try {
      const rows = await search({ data: { query: q } });
      setResults(rows);
    } finally {
      setSearching(false);
    }
  }

  function selectResult(r: GeocodeResult) {
    setQuery(r.display_name);
    setResults([]);
    onChange({ location_name: r.display_name, latitude: r.latitude, longitude: r.longitude });
    if (mapRef.current) {
      const { L, map } = mapRef.current;
      map.setView([r.latitude, r.longitude], 10);
      if (markerRef.current) markerRef.current.setLatLng([r.latitude, r.longitude]);
      else markerRef.current = L.marker([r.latitude, r.longitude], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        onChange({ location_name: query, latitude: lat, longitude: lng });
      });
    }
  }

  useEffect(() => {
    if (!pickerOpen) return;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapEl.current) return;
      const start: [number, number] =
        value.latitude != null && value.longitude != null ? [value.latitude, value.longitude] : [20, 0];
      const zoom = value.latitude != null ? 8 : 2;
      const map = L.map(mapEl.current).setView(start, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = { map, L };
      if (value.latitude != null && value.longitude != null) {
        markerRef.current = L.marker([value.latitude, value.longitude], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          onChange({ location_name: query, latitude: lat, longitude: lng });
        });
      }
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", (ev: any) => {
            const p = ev.target.getLatLng();
            onChange({ location_name: query, latitude: p.lat, longitude: p.lng });
          });
        }
        onChange({ location_name: query, latitude: lat, longitude: lng });
      });
    })();
    return () => {
      cancelled = true;
      if (mapRef.current?.map) {
        mapRef.current.map.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [pickerOpen]);

  return (
    <div className="space-y-3 vintage-map">
      <label className="block text-sm">
        <span className="text-muted-foreground text-xs uppercase tracking-wide">Location name</span>
        <div className="mt-1 flex gap-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange({ ...value, location_name: e.target.value });
            }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(query); } }}
            placeholder="Search location…"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={() => runSearch(query)}
            disabled={searching || query.trim().length < 2}
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-wide"
          >
            {searching ? "…" : "Search"}
          </button>
        </div>
      </label>

      {results.length > 0 && (
        <ul className="paper rounded-sm p-2 max-h-56 overflow-auto text-sm">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-2 py-1 rounded hover:bg-[color:var(--blush)]/40 serif italic"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">Latitude</span>
          <input
            type="number"
            step="any"
            value={value.latitude ?? ""}
            onChange={(e) => onChange({ ...value, latitude: e.target.value === "" ? null : Number(e.target.value) })}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">Longitude</span>
          <input
            type="number"
            step="any"
            value={value.longitude ?? ""}
            onChange={(e) => onChange({ ...value, longitude: e.target.value === "" ? null : Number(e.target.value) })}
            className="input mt-1"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        className="text-sm text-primary underline"
      >
        {pickerOpen ? "Hide map" : "Pick on Map"}
      </button>

      {pickerOpen && (
        <div className="aged-paper stitched p-2 rounded-sm">
          <div ref={mapEl} style={{ height: 300, borderRadius: 2, overflow: "hidden" }} />
          <p className="text-xs text-muted-foreground mt-2 italic">Click the map or drag the pin.</p>
        </div>
      )}

      {value.latitude != null && value.longitude != null && (
        <button
          type="button"
          onClick={() => onChange({ location_name: null, latitude: null, longitude: null })}
          className="text-xs text-destructive"
        >
          Clear location
        </button>
      )}
    </div>
  );
}
