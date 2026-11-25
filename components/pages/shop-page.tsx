"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { isLineActive } from "@/lib/store-scope";
import type { Product } from "@/types/ecommerce";

type ShopSection = "all" | "football" | "new" | "retro" | "accessories" | "training" | "f678";
type PriceFilter = "all" | "under-90" | "90-110" | "over-110";
type AvailabilityFilter = "all" | "available" | "sold-out";
type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

type ShopPageProps = {
  products: Product[];
  initialCategory?: string;
  initialBrand?: string;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

const SEARCH_ICON = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
const CLOSE_ICON = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12" /></svg>;
const PAGE_SIZE = 8;

const SECTIONS: Array<{ id: ShopSection; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "football", label: "Fútbol" },
  { id: "new", label: "Nueva temporada" },
  { id: "retro", label: "Retro" },
  { id: "accessories", label: "Accesorios" },
  { id: "training", label: "Training" },
  { id: "f678", label: "Fútbol 6 / 7 / 8" },
];

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getInitialSection(category?: string, brand?: string): ShopSection {
  const value = `${category ?? ""} ${brand ?? ""}`.toUpperCase();
  if (value.includes("RETRO")) return "retro";
  if (value.includes("TRAINING")) return "training";
  if (value.includes("NUEV")) return "new";
  if (value.includes("FUTBOL") || value.includes("FÚTBOL")) return "football";
  return "all";
}

function matchesSection(product: Product, section: ShopSection) {
  if (section === "all") return true;
  if (section === "football") return product.brand === "FUTBOL";
  if (section === "new") return product.badge === "NUEVO";
  if (section === "retro") return product.category === "FUTBOL_RETRO";
  if (section === "training") return product.brand === "TRAINING";
  return false;
}

function matchesPrice(product: Product, price: PriceFilter) {
  if (price === "under-90") return product.price.amount < 90000;
  if (price === "90-110") return product.price.amount >= 90000 && product.price.amount <= 110000;
  if (price === "over-110") return product.price.amount > 110000;
  return true;
}

function sortProducts(products: Product[], sort: SortOption) {
  const next = [...products];
  if (sort === "price-asc") return next.sort((a, b) => a.price.amount - b.price.amount);
  if (sort === "price-desc") return next.sort((a, b) => b.price.amount - a.price.amount);
  if (sort === "newest") return next.sort((a, b) => Number(b.badge === "NUEVO") - Number(a.badge === "NUEVO"));
  return next.sort((a, b) => {
    const footballPriority = Number(b.brand === "FUTBOL") - Number(a.brand === "FUTBOL");
    if (footballPriority) return footballPriority;
    return Number(Boolean(b.badge)) - Number(Boolean(a.badge));
  });
}

export function ShopPage({ products, initialCategory, initialBrand }: Readonly<ShopPageProps>) {
  const [section, setSection] = useState<ShopSection>(() => getInitialSection(initialCategory, initialBrand));
  const [query, setQuery] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [price, setPrice] = useState<PriceFilter>("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [personalizableOnly, setPersonalizableOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDialogElement>(null);

  const sectionCounts = useMemo(
    () => Object.fromEntries(SECTIONS.map((item) => [item.id, products.filter((product) => matchesSection(product, item.id)).length])) as Record<ShopSection, number>,
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const filtered = products.filter((product) => {
      const searchable = normalizeText([
        product.name,
        product.team,
        product.category,
        product.brand,
        product.description,
      ].join(" "));
      const hasAvailableVariants = product.variants.length > 0;

      return matchesSection(product, section)
        && (!normalizedQuery || searchable.includes(normalizedQuery))
        && (!sizes.length || sizes.some((size) => product.variants.some((variant) => variant.size === size)))
        && matchesPrice(product, price)
        && (availability === "all" || (availability === "available" ? hasAvailableVariants : !hasAvailableVariants))
        && (!personalizableOnly || product.personalizable);
    });
    return sortProducts(filtered, sort);
  }, [availability, personalizableOnly, price, products, query, section, sizes, sort]);

  const activeFilterCount = sizes.length + Number(price !== "all") + Number(availability !== "all") + Number(personalizableOnly);
  const hasFilters = section !== "all" || query.trim() || activeFilterCount > 0;

  // M5: el cajón de filtros sale hacia abajo en 200 ms antes de desmontarse (al instante con movimiento reducido).
  // Solo cambia cuándo se cierra; los filtros aplicados no dependen de esto.
  const [filtersClosing, setFiltersClosing] = useState(false);
  const closeFilters = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setFiltersOpen(false);
    else setFiltersClosing(true);
  }, []);
  useEffect(() => {
    if (!filtersClosing) return;
    const timeout = window.setTimeout(() => {
      setFiltersOpen(false);
      setFiltersClosing(false);
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [filtersClosing]);

  useEffect(() => {
    if (!filtersOpen) return;
    const dialog = filterDialogRef.current;
    dialog?.showModal();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFilters();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (dialog?.open) dialog.close();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen, closeFilters]);

  const resetVisible = () => setVisible(PAGE_SIZE);
  const selectSection = (nextSection: ShopSection) => {
    setSection(nextSection);
    resetVisible();
  };
  const toggleSize = (size: string) => {
    setSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]);
    resetVisible();
  };
  const clearFilters = () => {
    setSection("all");
    setQuery("");
    setSizes([]);
    setPrice("all");
    setAvailability("all");
    setPersonalizableOnly(false);
    resetVisible();
  };

  const filters = (
    <div className="shop-filter-groups">
      <fieldset className="shop-filter-group">
        <legend>Talla</legend>
        <div className="shop-filter-sizes">
          {SIZES.map((size) => (
            <button type="button" key={size} className={sizes.includes(size) ? "is-selected" : ""} onClick={() => toggleSize(size)} aria-pressed={sizes.includes(size)}>
              {size}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="shop-filter-group">
        <span>Precio</span>
        <select value={price} onChange={(event) => { setPrice(event.target.value as PriceFilter); resetVisible(); }}>
          <option value="all">Todos los precios</option>
          <option value="under-90">Menos de $90.000</option>
          <option value="90-110">$90.000 - $110.000</option>
          <option value="over-110">Más de $110.000</option>
        </select>
      </label>

      <label className="shop-filter-group">
        <span>Disponibilidad</span>
        <select value={availability} onChange={(event) => { setAvailability(event.target.value as AvailabilityFilter); resetVisible(); }}>
          <option value="all">Todos</option>
          <option value="available">Disponibles</option>
          <option value="sold-out">Agotados</option>
        </select>
      </label>

      <label className="shop-filter-check">
        <input type="checkbox" checked={personalizableOnly} onChange={(event) => { setPersonalizableOnly(event.target.checked); resetVisible(); }} />
        <span>Solo personalizables</span>
      </label>

      {hasFilters ? <button type="button" className="shop-clear-filters" onClick={clearFilters}>Limpiar filtros</button> : null}
    </div>
  );

  return (
    <div className="shop-page">
      {/* Cabecera sin foto de stock: el catálogo es lo que se mira (UX4). */}
      <header className="shop-hero">
        <nav aria-label="Migas de pan" className="shop-breadcrumbs">
          <Link href="/">Inicio</Link><span aria-hidden="true">/</span><span aria-current="page">Tienda</span>
        </nav>
        <h1 className="font-display">Tienda</h1>
        <p>Camisetas de fútbol de diseño propio: clubes, selecciones y retro, con envío a toda Colombia.</p>
      </header>

      <nav className="shop-category-nav" aria-label="Categorías de tienda">
        <div>
          {/* Las líneas sin productos no se anuncian (antes salían tachadas como "Próximamente"). */}
          {SECTIONS.filter((item) => (item.id !== "training" || isLineActive("TRAINING")) && (item.id === "all" || item.id === section || sectionCounts[item.id] > 0)).map((item) => (
            <button
              type="button"
              key={item.id}
              className={section === item.id ? "is-active" : ""}
              onClick={() => selectSection(item.id)}
              aria-pressed={section === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="shop-catalog" aria-labelledby="shop-results-title">
        <div className="shop-tools">
          <label className="shop-search">
            <span className="shop-visually-hidden">Buscar productos</span>
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); resetVisible(); }}
              placeholder="Busca equipo, camiseta o colección"
            />
            <span className="shop-search-icon">{SEARCH_ICON}</span>
          </label>

          <div className="shop-mobile-tools">
            <button type="button" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="shop-filter-dialog">
              Filtrar{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
            <label>
              <span className="shop-visually-hidden">Ordenar productos</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
                <option value="featured">Destacados</option>
                <option value="newest">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
            </label>
          </div>

          <label className="shop-sort">
            <span>Ordenar</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
              <option value="featured">Destacados</option>
              <option value="newest">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </label>
        </div>

        <div className="shop-catalog-layout">
          <aside className="shop-filter-sidebar" aria-label="Filtros de productos">{filters}</aside>

          <div className="shop-results">
            <header className="shop-results-header">
              <h2 id="shop-results-title" className="font-display">{filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}</h2>
              <p aria-live="polite">{query ? `Resultados para “${query}”` : ""}</p>
            </header>

            {filteredProducts.length ? (
              <>
                <div className="product-grid">
                  {filteredProducts.slice(0, visible).map((product, index) => <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />)}
                </div>
                {visible < filteredProducts.length ? (
                  <div className="shop-load-more">
                    <button type="button" className="btn-outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                      Ver más productos ({filteredProducts.length - visible})
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="shop-empty-state">
                <h2 className="font-display">No encontramos lo que buscas</h2>
                <p>Prueba otra categoría o quita los filtros activos.</p>
                <button type="button" className="btn-primary" onClick={() => { clearFilters(); setSection("football"); }}>VER TODO EL FÚTBOL</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {filtersOpen ? (
        <div className="shop-filter-modal">
          <dialog
            ref={filterDialogRef}
            id="shop-filter-dialog"
            aria-labelledby="shop-filter-title"
            className={`shop-filter-drawer${filtersClosing ? " is-closing" : ""}`}
            onCancel={(event) => { event.preventDefault(); closeFilters(); }}
          >
            <header><h2 id="shop-filter-title" className="font-display">Filtrar productos</h2><button type="button" autoFocus onClick={closeFilters} aria-label="Cerrar filtros">{CLOSE_ICON}</button></header>
            {filters}
            <button type="button" className="btn-primary shop-apply-filters" onClick={closeFilters}>VER {filteredProducts.length} {filteredProducts.length === 1 ? "PRODUCTO" : "PRODUCTOS"}</button>
          </dialog>
        </div>
      ) : null}
    </div>
  );
}