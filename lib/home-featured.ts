// Reglas puras del inicio (slide de producto y parrilla de destacados), sin React, para poder probarlas.
import type { Product } from "@/types/ecommerce";

/** Cuántas camisetas caben en la parrilla del inicio: dos filas de cuatro en escritorio. */
export const FEATURED_GRID_LIMIT = 8;

/** Slug de la ficha a la que enlaza un botón (/productos/slug), o null si enlaza a otra página. */
export function productSlugFromHref(href: string) {
  return /^\/productos\/([a-z0-9-]+)\/?(?:[?#].*)?$/i.exec(href.trim())?.[1] ?? null;
}

type RankableProduct = Pick<Product, "badge" | "variants">;

/** Primero las que tienen etiqueta (más vendida, nueva, limitada) y stock; después el resto, en el orden del catálogo. */
export function rankFeatured<T extends RankableProduct>(products: readonly T[]) {
  const score = (product: T) => (product.variants.length ? 0 : 2) + (product.badge ? 0 : 1);
  return products
    .map((product, index) => ({ product, index }))
    .sort((left, right) => score(left.product) - score(right.product) || left.index - right.index)
    .map(({ product }) => product);
}
