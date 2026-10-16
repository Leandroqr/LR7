"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, getCategoryDisplayName, PRODUCTS } from "@/lib/products";
import type { Category, Product, ProductBrand } from "@/types/ecommerce";
import { PageHero } from "@/components/layout/page-hero";
import { ProductCard } from "@/components/product/product-card";

type CatalogPageProps = {
  initialCategory?: string;
  brand?: ProductBrand;
  products?: Product[];
  categories?: Category[];
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

function matchesCatalogCategory(product: Product, category: string) {
  if (category === "FUTBOL" || category === "FUTBOL_CAMISETAS") return product.brand === "FUTBOL";
  if (category === "TRAINING") return product.brand === "TRAINING";
  return product.category === category;
}

export function CatalogPage({
  initialCategory,
  brand,
  products = PRODUCTS,
  categories = CATEGORIES,
}: Readonly<CatalogPageProps>) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory.toUpperCase()] : [],
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [personalizable, setPersonalizable] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(6);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter categories by brand if provided
  const availableCategories = useMemo(() => {
    if (!brand) return categories;
    return categories.filter((cat) => !cat.parentBrand || cat.parentBrand === brand);
  }, [brand, categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by brand first
      if (brand && product.brand !== brand) {
        return false;
      }

      if (selectedCategories.length > 0 && !selectedCategories.some((category) => matchesCatalogCategory(product, category))) {
        return false;
      }
      if (
        selectedSizes.length > 0 &&
        !selectedSizes.some((size) => product.variants.some((variant) => variant.size === size))
      ) {
        return false;
      }
      if (personalizable !== null && product.personalizable !== personalizable) {
        return false;
      }
      return true;
    });
  }, [brand, products, selectedCategories, selectedSizes, personalizable]);

  const hasFilters = selectedCategories.length > 0 || selectedSizes.length > 0 || personalizable !== null;
  const activeFilterCount = selectedCategories.length + selectedSizes.length + Number(personalizable !== null);

  const toggleString = (
    current: string[],
    setter: (value: string[]) => void,
    value: string,
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  // Determine page title based on brand
  const pageTitle = brand === "TRAINING" ? "ROPA DE ENTRENAMIENTO" : "CAMISETAS DE FÚTBOL";
  const pageSubtitle = brand === "TRAINING" 
    ? "Descubre nuestra colección de ropa deportiva para entrenamientos, gimnasio y actividad física."
    : "Explora nuestra colección y encuentra la camiseta que representa tu pasión.";

  return (
    <>
      <PageHero
        label={brand === "TRAINING" ? "— TRAINING" : "— FÚTBOL"}
        title={pageTitle}
        sub={pageSubtitle}
      />
      <section style={{ padding: "4rem 0 6rem", background: "var(--color-primary)" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "3rem", alignItems: "start" }} className="catalog-grid">
            <button
              type="button"
              className="catalog-mobile-filter-trigger"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="catalog-filter-panel"
            >
              FILTRAR {activeFilterCount ? `(${activeFilterCount})` : ""}
            </button>
            <aside id="catalog-filter-panel" className={`catalog-filter-panel${filtersOpen ? " is-open" : ""}`} style={{ position: "sticky", top: "90px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div>
                  <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--color-text-muted)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase", marginBottom: "1rem" }}>
                    CATEGORIA
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {availableCategories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => toggleString(selectedCategories, setSelectedCategories, category.name)}
                        aria-pressed={selectedCategories.includes(category.name)}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "none", border: "none", cursor: "pointer", padding: "0.3rem 0", textAlign: "left" }}
                      >
                        <div style={{ width: "16px", height: "16px", border: `1.5px solid ${selectedCategories.includes(category.name) ? "var(--color-accent)" : "rgba(255,255,255,0.2)"}`, background: selectedCategories.includes(category.name) ? "var(--color-accent)" : "transparent" }} />
                        <span className="font-display" style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.06em", color: selectedCategories.includes(category.name) ? "var(--color-dark)" : "var(--color-text-muted)" }}>
                          {getCategoryDisplayName(category.name)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--color-text-muted)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase", marginBottom: "1rem" }}>
                    TALLA
                  </p>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleString(selectedSizes, setSelectedSizes, size)}
                        aria-pressed={selectedSizes.includes(size)}
                        className={`size-btn ${selectedSizes.includes(size) ? "active" : ""}`}
                        style={{ width: "40px", height: "40px", fontSize: "0.8rem" }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--color-text-muted)", fontFamily: "'Barlow Condensed'", fontWeight: 700, textTransform: "uppercase", marginBottom: "1rem" }}>
                    PERSONALIZABLE
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[{ value: true, label: "SI" }, { value: false, label: "NO" }].map((option) => (
                      <button
                        key={String(option.value)}
                        onClick={() => setPersonalizable(personalizable === option.value ? null : option.value)}
                        aria-pressed={personalizable === option.value}
                        style={{ padding: "0.4rem 1rem", background: personalizable === option.value ? "var(--color-accent)" : "transparent", color: personalizable === option.value ? "var(--color-white)" : "var(--color-text-muted)", border: `1px solid ${personalizable === option.value ? "var(--color-accent)" : "var(--color-border)"}`, fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.1em", cursor: "pointer" }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasFilters ? (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedSizes([]);
                      setPersonalizable(null);
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textAlign: "left", padding: 0, textTransform: "uppercase" }}
                  >
                    LIMPIAR FILTROS
                  </button>
                ) : null}
              </div>
            </aside>

            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 300, marginBottom: "2rem" }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? "camiseta" : "camisetas"}
              </p>
              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                  <p className="font-display" style={{ fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "1rem" }}>
                    SIN RESULTADOS
                  </p>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontWeight: 300 }}>
                    Intenta con otros filtros.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedSizes([]);
                      setPersonalizable(null);
                    }}
                    className="btn-primary"
                  >
                    VER TODOS
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))", gap: "2px" }}>
                    {filteredProducts.slice(0, visible).map((product, index) => (
                      <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />
                    ))}
                  </div>
                  {visible < filteredProducts.length ? (
                    <div style={{ textAlign: "center", marginTop: "3rem" }}>
                      <button onClick={() => setVisible((count) => count + 6)} className="btn-outline">
                        VER MAS ({filteredProducts.length - visible} restantes)
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <style>{`.catalog-grid { grid-template-columns: 220px 1fr !important; } .catalog-mobile-filter-trigger { display: none; } @media(max-width:900px){.catalog-grid{grid-template-columns:1fr !important;}.catalog-mobile-filter-trigger{display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:1rem;padding:1rem;border:1px solid var(--color-border);background:var(--color-white);color:var(--color-dark);font-family:var(--font-display),sans-serif;font-weight:800;letter-spacing:.08em;text-align:left;cursor:pointer}.catalog-filter-panel{display:none;position:static!important;top:auto!important}.catalog-filter-panel.is-open{display:block;margin-bottom:1.5rem;padding:1rem;border:1px solid var(--color-border);background:var(--color-white);}}`}</style>
    </>
  );
}
