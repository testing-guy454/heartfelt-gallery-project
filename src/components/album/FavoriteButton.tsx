import { useState } from "react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({
  photoId,
  className = "",
  onToggle,
}: {
  photoId: string;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}) {
  const [fav, setFav] = useState(() => isFavorite(photoId));

  function onClick() {
    const next = toggleFavorite(photoId);
    setFav(next);
    onToggle?.(next);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      title={fav ? "Remove from favorites" : "Add to favorites"}
      className={[
        "group rounded-full w-8 h-8 flex items-center justify-center",
        "bg-background/85 border border-[color:var(--gold)]/40 shadow-sm",
        "backdrop-blur-sm hover:scale-110 transition-transform duration-200",
        className,
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        style={{ color: fav ? "var(--rose-deep, #B24A5E)" : "var(--ink, currentColor)" }}
      >
        <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z" />
      </svg>
    </button>
  );
}

