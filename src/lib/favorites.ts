const STORAGE_KEY = "album-favorite-ids";

export function getFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function isFavorite(photoId: string): boolean {
  return getFavoriteIds().includes(photoId);
}

export function toggleFavorite(photoId: string): boolean {
  const ids = getFavoriteIds();
  const idx = ids.indexOf(photoId);
  if (idx >= 0) {
    ids.splice(idx, 1);
  } else {
    ids.push(photoId);
  }
  setFavoriteIds(ids);
  return idx < 0; // true if added
}
