import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca camisetas por equipo, categoría o nombre.",
  alternates: { canonical: "/buscar" },
  robots: {
    index: false,
    follow: true,
  },
};

type SearchPageProps = Readonly<{
  searchParams?: Promise<{ q?: string | string[] }>;
}>;

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const queryValue = params?.q;
  const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const normalized = normalizeSearchText(query);
  const products = await getPublicProducts();
  const results = query
    ? products.filter(
        (product) =>
          normalizeSearchText(product.name).includes(normalized) ||
          normalizeSearchText(product.category).includes(normalized) ||
          normalizeSearchText(product.team).includes(normalized),
      )
    : [];
  let resultsContent = <p className="listing-count">Escribe un equipo, una selección o una categoría.</p>;

  if (query && results.length === 0) {
    resultsContent = (
      <div className="shop-empty-state">
        <h2 className="font-display">No encontramos esa camiseta</h2>
        <p>Prueba con otro equipo, selección o categoría.</p>
        <Link href="/tienda" className="btn-primary">VER TODA LA TIENDA</Link>
      </div>
    );
  } else if (query) {
    resultsContent = (
      <>
        <p className="listing-count">{results.length} {results.length === 1 ? "resultado" : "resultados"}</p>
        <div className="product-grid">
          {results.map((product, index) => (
            <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="shop-page">
      <header className="shop-hero search-hero">
        <h1 className="font-display">{query ? `Resultados para “${query}”` : "Busca tu camiseta"}</h1>
        <form action="/buscar" method="get" role="search" className="search-form">
          <label className="shop-search">
            <span className="shop-visually-hidden">Buscar por equipo, selección o categoría</span>
            <input type="search" name="q" defaultValue={query} placeholder="Equipo, selección o categoría" enterKeyHint="search" />
            <span className="shop-search-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></span>
          </label>
          <button type="submit" className="btn-primary">BUSCAR</button>
        </form>
      </header>

      <section className="shop-catalog">{resultsContent}</section>
    </div>
  );
}
