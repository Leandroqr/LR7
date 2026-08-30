"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
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
const PAGE_SIZE = 8;

const SECTIONS: Array<{ id: ShopSection; label: string }> = [
  { id: "all", label: "TODOS" },
  { id: "football", label: "FÚTBOL" },
  { id: "new", label: "NUEVA TEMPORADA" },
  { id: "retro", label: "RETRO" },
  { id: "accessories", label: "ACCESORIOS" },
  { id: "training", label: "TRAINING" },
  { id: "f678", label: "FÚTBOL 6 / 7 / 8" },
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

  useEffect(() => {
    if (!filtersOpen) return;
    const dialog = filterDialogRef.current;
    dialog?.showModal();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (dialog?.open) dialog.close();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

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
        <legend>TALLA</legend>
        <div className="shop-filter-sizes">
          {SIZES.map((size) => (
            <button type="button" key={size} className={sizes.includes(size) ? "is-selected" : ""} onClick={() => toggleSize(size)} aria-pressed={sizes.includes(size)}>
              {size}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="shop-filter-group">
        <span>PRECIO</span>
        <select value={price} onChange={(event) => { setPrice(event.target.value as PriceFilter); resetVisible(); }}>
          <option value="all">Todos los precios</option>
          <option value="under-90">Menos de $90.000</option>
          <option value="90-110">$90.000 - $110.000</option>
          <option value="over-110">Más de $110.000</option>
        </select>
      </label>

      <label className="shop-filter-group">
        <span>DISPONIBILIDAD</span>
        <select value={availability} onChange={(event) => { setAvailability(event.target.value as AvailabilityFilter); resetVisible(); }}>
          <option value="all">Todos</option>
          <option value="available">Disponibles</option>
          <option value="sold-out">Agotados</option>
        </select>
      </label>

      <label className="shop-filter-check">
        <input type="checkbox" checked={personalizableOnly} onChange={(event) => { setPersonalizableOnly(event.target.checked); resetVisible(); }} />
        <span>SOLO PERSONALIZABLES</span>
      </label>

      {hasFilters ? <button type="button" className="shop-clear-filters" onClick={clearFilters}>LIMPIAR FILTROS</button> : null}
    </div>
  );

  return (
    <main className="shop-page">
      <header className="shop-hero">
        <nav aria-label="Migas de pan" className="shop-breadcrumbs">
          <Link href="/">INICIO</Link><span aria-hidden="true">/</span><span>TIENDA</span>
        </nav>
        <div className="shop-hero-copy">
          <p>LR7 / SHOP</p>
          <h1 className="font-display">FOOTBALL<br /><span>BUILT FOR THE GAME.</span></h1>
          <div>
            <span>CAMISETAS</span><span>RETRO</span><span>TRAINING</span>
          </div>
        </div>
        <p className="shop-hero-note">Fútbol primero. Piezas para jugar, entrenar y llevar la historia del juego.</p>
      </header>

      <nav className="shop-category-nav" aria-label="Categorías de tienda">
        <div>
          {SECTIONS.map((item) => {
            const disabled = sectionCounts[item.id] === 0;
            return (
              <button
                type="button"
                key={item.id}
                className={section === item.id ? "is-active" : ""}
                onClick={() => selectSection(item.id)}
                aria-pressed={section === item.id}
                disabled={disabled}
                title={disabled ? "Próximamente" : undefined}
              >
                <span>{item.label}</span>
                {section === item.id ? <span aria-hidden="true">●</span> : null}
              </button>
            );
          })}
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
              placeholder="BUSCAR EQUIPO, CAMISETA O COLECCIÓN"
            />
            <span aria-hidden="true">⌕</span>
          </label>

          <div className="shop-mobile-tools">
            <button type="button" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="shop-filter-dialog">
              FILTRAR {activeFilterCount ? `(${activeFilterCount})` : ""}
            </button>
            <label>
              <span className="shop-visually-hidden">Ordenar productos</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
                <option value="featured">DESTACADOS</option>
                <option value="newest">MÁS RECIENTES</option>
                <option value="price-asc">PRECIO: MENOR A MAYOR</option>
                <option value="price-desc">PRECIO: MAYOR A MENOR</option>
              </select>
            </label>
          </div>

          <label className="shop-sort">
            <span>ORDENAR</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
              <option value="featured">DESTACADOS</option>
              <option value="newest">MÁS RECIENTES</option>
              <option value="price-asc">PRECIO: MENOR A MAYOR</option>
              <option value="price-desc">PRECIO: MAYOR A MENOR</option>
            </select>
          </label>
        </div>

        <div className="shop-catalog-layout">
          <aside className="shop-filter-sidebar" aria-label="Filtros de productos">{filters}</aside>

          <div className="shop-results">
            <header className="shop-results-header">
              <div>
                <p>{section === "all" ? "COLECCIÓN LR7" : SECTIONS.find((item) => item.id === section)?.label}</p>
                <h2 id="shop-results-title" className="font-display">{filteredProducts.length} {filteredProducts.length === 1 ? "PRODUCTO" : "PRODUCTOS"}</h2>
              </div>
              <p aria-live="polite">{query ? `RESULTADOS PARA “${query}”` : "FOOTBALL FIRST / TRAINING SECOND"}</p>
            </header>

            {filteredProducts.length ? (
              <>
                <div className="shop-product-grid">
                  {filteredProducts.slice(0, visible).map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
                {visible < filteredProducts.length ? (
                  <div className="shop-load-more">
                    <button type="button" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                      VER MÁS <span>({filteredProducts.length - visible})</span>
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="shop-empty-state">
                <p>0 / {products.length}</p>
                <h2 className="font-display">NO ENCONTRAMOS<br />LO QUE BUSCAS.</h2>
                <span>Prueba otra categoría o elimina los filtros activos.</span>
                <button type="button" onClick={() => { clearFilters(); setSection("football"); }}>VER TODO EL FÚTBOL</button>
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
            className="shop-filter-drawer"
            onCancel={(event) => { event.preventDefault(); setFiltersOpen(false); }}
          >
            <header><h2 id="shop-filter-title">FILTRAR PRODUCTOS</h2><button type="button" autoFocus onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">×</button></header>
            {filters}
            <button type="button" className="shop-apply-filters" onClick={() => setFiltersOpen(false)}>VER {filteredProducts.length} PRODUCTOS</button>
          </dialog>
        </div>
      ) : null}
    </main>
  );
}