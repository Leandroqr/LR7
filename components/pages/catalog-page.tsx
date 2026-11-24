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
  const pageTitle = brand === "TRAINING" ? "Ropa de entrenamiento" : "Camisetas de fútbol";
  const pageSubtitle = brand === "TRAINING" 
    ? "Descubre nuestra colección de ropa deportiva para entrenamientos, gimnasio y actividad física."
    : "Explora nuestra colección y encuentra la camiseta que representa tu pasión.";

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPersonalizable(null);
  };

  return (
    <>
      <PageHero title={pageTitle} sub={pageSubtitle} />
      <section className="shop-catalog catalog-section">
        <div className="shop-catalog-layout catalog-layout">
          <button
            type="button"
            className="catalog-mobile-filter-trigger"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filter-panel"
          >
            Filtrar{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
          <aside id="catalog-filter-panel" className={`shop-filter-sidebar catalog-filter-panel${filtersOpen ? " is-open" : ""}`} aria-label="Filtros de productos">
            <div className="shop-filter-groups">
              <fieldset className="shop-filter-group">
                <legend>Categoría</legend>
                <div className="catalog-filter-options">
                  {availableCategories.map((category) => (
                    <label key={category.slug} className="shop-filter-check">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => toggleString(selectedCategories, setSelectedCategories, category.name)}
                      />
                      <span>{getCategoryDisplayName(category.name)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="shop-filter-group">
                <legend>Talla</legend>
                <div className="shop-filter-sizes">
                  {SIZES.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleString(selectedSizes, setSelectedSizes, size)}
                      aria-pressed={selectedSizes.includes(size)}
                      className={selectedSizes.includes(size) ? "is-selected" : ""}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="shop-filter-group">
                <legend>Personalizable</legend>
                <div className="shop-filter-sizes">
                  {[{ value: true, label: "Sí" }, { value: false, label: "No" }].map((option) => (
                    <button
                      type="button"
                      key={String(option.value)}
                      onClick={() => setPersonalizable(personalizable === option.value ? null : option.value)}
                      aria-pressed={personalizable === option.value}
                      className={personalizable === option.value ? "is-selected" : ""}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {hasFilters ? (
                <button type="button" className="shop-clear-filters" onClick={clearFilters}>Limpiar filtros</button>
              ) : null}
            </div>
          </aside>

          <div className="shop-results">
            <header className="shop-results-header">
              <h2 className="font-display">{filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}</h2>
            </header>
            {filteredProducts.length === 0 ? (
              <div className="shop-empty-state">
                <h2 className="font-display">Sin resultados</h2>
                <p>Prueba con otros filtros.</p>
                <button type="button" onClick={clearFilters} className="btn-primary">VER TODOS</button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {filteredProducts.slice(0, visible).map((product, index) => (
                    <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />
                  ))}
                </div>
                {visible < filteredProducts.length ? (
                  <div className="shop-load-more">
                    <button type="button" onClick={() => setVisible((count) => count + 6)} className="btn-outline">
                      Ver más productos ({filteredProducts.length - visible})
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
