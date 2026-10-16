import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca camisetas por equipo, categoria o nombre.",
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
  let resultsContent = (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", fontWeight: 300 }}>Escribe algo para empezar a buscar.</p>
    </div>
  );

  if (query && results.length === 0) {
    resultsContent = (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p className="font-display" style={{ fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "1rem" }}>NO ENCONTRAMOS ESA CAMISETA</p>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontWeight: 300 }}>Prueba con otro equipo, selección o categoría.</p>
        <Link href="/tienda" className="btn-primary">VER TODO EL CATALOGO</Link>
      </div>
    );
  } else if (query) {
    resultsContent = (
      <>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "2rem", fontWeight: 300 }}>
          {results.length} {results.length === 1 ? "resultado" : "resultados"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "2px" }}>
          {results.map((product, index) => (
            <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh", paddingTop: "80px" }}>
      <section style={{ padding: "4rem 2rem 3rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p className="font-display" style={{ fontSize: "0.75rem", letterSpacing: "0.25em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            — BUSQUEDA
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, marginBottom: "2rem" }}>
            {query ? <>RESULTADOS PARA: <span style={{ color: "var(--color-accent)" }}>&quot;{query.toUpperCase()}&quot;</span></> : "BUSCA TU CAMISETA"}
          </h1>
          <form action="/buscar" method="get">
            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <input aria-label="Buscar por equipo, selección o categoría" name="q" defaultValue={query} placeholder="BUSCA UN EQUIPO, SELECCION O CATEGORIA..." style={{ flex: 1, background: "var(--color-ice)", border: "none", color: "var(--color-dark)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "1rem 1.25rem" }} />
              <button type="submit" className="btn-primary" style={{ borderRadius: 0 }}>
                BUSCAR
              </button>
            </div>
          </form>
        </div>
      </section>

      <section style={{ padding: "4rem 2rem 6rem" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          {resultsContent}
        </div>
      </section>
    </div>
  );
}
