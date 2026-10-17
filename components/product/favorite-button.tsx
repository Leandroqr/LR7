"use client";

import { useStore } from "@/components/providers/store-provider";
import type { ProductId } from "@/types/ecommerce";

export function FavoriteButton({ productId }: { productId: ProductId }) {
  const { favorites, toggleFavorite } = useStore();
  const isFavorite = favorites.includes(productId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(productId);
      }}
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        zIndex: 2,
        background: isFavorite ? "var(--color-accent)" : "rgba(255,255,255,0.86)",
        border: "none",
        width: "44px",
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.2s, transform 0.2s",
        transform: isFavorite ? "scale(1.1)" : "scale(1)",
      }}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isFavorite}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorite ? "var(--color-white)" : "none"} stroke={isFavorite ? "var(--color-white)" : "var(--color-dark)"} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
