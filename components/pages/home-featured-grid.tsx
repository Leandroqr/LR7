"use client";

import Link from "next/link";
import { useState } from "react";
import { TrackItemList } from "@/components/analytics/track-item-list";
import { ProductCard } from "@/components/product/product-card";
import { toAnalyticsItem } from "@/lib/analytics";
import { FEATURED_GRID_LIMIT, rankFeatured } from "@/lib/home-featured";
import type { Product } from "@/types/ecommerce";

type FilterId = "all" | "new" | "clubs" | "national" | "retro";

// Cada filtro lleva a su página completa, para que el botón del pie siga lo que el visitante eligió.
const FILTERS: ReadonlyArray<{ id: FilterId; label: string; href: string; cta: string; matches: (product: Product) => boolean }> = [
  { id: "all", label: "Todo", href: "/tienda", cta: "VER TODA LA TIENDA", matches: () => true },
  { id: "new", label: "Nuevas", href: "/tienda?cat=NUEVO", cta: "VER NOVEDADES", matches: (product) => product.badge === "NUEVO" },
  { id: "clubs", label: "Clubes", href: "/categorias/futbol-clubes", cta: "VER CLUBES", matches: (product) => product.category === "FUTBOL_CLUBES" },
  { id: "national", label: "Selecciones", href: "/categorias/futbol-selecciones", cta: "VER SELECCIONES", matches: (product) => product.category === "FUTBOL_SELECCIONES" },
  { id: "retro", label: "Retro", href: "/categorias/futbol-retro", cta: "VER RETRO", matches: (product) => product.category === "FUTBOL_RETRO" },
];

/**
 * Destacados, justo debajo del hero: la tienda en la primera pantalla, con filtros rápidos que no
 * salen del inicio. Solo camisetas de fútbol reales del catálogo; un filtro sin productos no se muestra.
 */
export function HomeFeaturedGrid({ products }: Readonly<{ products: Product[] }>) {
  const football = rankFeatured(products.filter((product) => product.brand === "FUTBOL"));
  const filters = FILTERS.filter((filter) => filter.id === "all" || football.some(filter.matches));
  const [filterId, setFilterId] = useState<FilterId>("all");
  const filter = filters.find((item) => item.id === filterId) ?? filters[0];
  const visible = football.filter(filter.matches).slice(0, FEATURED_GRID_LIMIT);

  if (!football.length) return null;

  return (
    <section className="home-featured" aria-labelledby="home-featured-title">
      <div className="home-section-head home-featured-head">
        <h2 id="home-featured-title" className="home-headline font-display">Destacados</h2>
        {filters.length > 1 ? (
          <div className="home-featured-filters" role="group" aria-label="Filtrar destacados">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === filter.id ? "is-active" : undefined}
                aria-pressed={item.id === filter.id}
                onClick={() => setFilterId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <ul className="product-grid home-featured-grid" aria-live="polite">
        {visible.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} imageLoading={index < 4 ? "eager" : "lazy"} />
          </li>
        ))}
      </ul>
      <div className="home-featured-footer">
        <Link href={filter.href} className="btn-outline">{filter.cta}</Link>
      </div>
      <TrackItemList
        listId={`inicio-destacados-${filter.id}`}
        listName={`Inicio: destacados (${filter.label})`}
        items={visible.map((product, index) => toAnalyticsItem(product, { index }))}
      />
    </section>
  );
}
