"use client";

import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { PageHero } from "@/components/layout/page-hero";
import { useStore } from "@/components/providers/store-provider";

export default function FavoritesPage() {
  const { favorites } = useStore();
  const favoriteProducts = PRODUCTS.filter((product) => favorites.includes(product.id));

  return (
    <>
      <PageHero label="— GUARDADAS" title="TUS FAVORITAS" />
      <section style={{ padding: "4rem 0 6rem", background: "var(--color-white)" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
          {favoriteProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
              <h2 className="font-display" style={{ fontSize: "2.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "1rem" }}>
                TODAVIA NO TIENES FAVORITOS
              </h2>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "2.5rem", fontWeight: 300 }}>
                Guarda las camisetas que mas te gusten con el corazon en cada producto.
              </p>
              <Link href="/tienda" className="btn-primary">
                EXPLORAR CATALOGO
              </Link>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 300, marginBottom: "2rem" }}>
                {favoriteProducts.length} {favoriteProducts.length === 1 ? "camiseta guardada" : "camisetas guardadas"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "2px" }}>
                {favoriteProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
