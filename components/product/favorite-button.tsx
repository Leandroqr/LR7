"use client";

import { useStore } from "@/components/providers/store-provider";
import type { ProductId } from "@/types/ecommerce";

// Botón de icono de 44 px (DESIGN.md → Motion: el corazón se rellena y pasa de 0,9 a 1 de escala).
export function FavoriteButton({ productId, productName, className }: Readonly<{ productId: ProductId; productName?: string; className?: string }>) {
  const { favorites, toggleFavorite } = useStore();
  const isFavorite = favorites.includes(productId);

  return (
    <button
      type="button"
      className={["favorite-button", isFavorite ? "is-active" : "", className ?? ""].filter(Boolean).join(" ")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(productId);
      }}
      aria-label={productName ? `${isFavorite ? "Quitar" : "Agregar"} ${productName} ${isFavorite ? "de" : "a"} favoritos` : isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={isFavorite}
    >
      <svg key={String(isFavorite)} className="favorite-button-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
