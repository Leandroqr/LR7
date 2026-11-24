"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { useStore } from "@/components/providers/store-provider";
import type { Product } from "@/types/ecommerce";

// Los favoritos viven en el navegador; el catálogo llega del servidor (el mismo que la tienda, LR7-061).
export function FavoritesList({ products }: Readonly<{ products: Product[] }>) {
  const { favorites } = useStore();
  const saved = new Set(favorites.map(String));
  const favoriteProducts = products.filter((product) => saved.has(String(product.id)));

  if (favoriteProducts.length === 0) {
    return (
      <div className="shop-empty-state">
        <h2 className="font-display">Todavía no tienes favoritas</h2>
        <p>Guarda las camisetas que más te gusten con el corazón en cada producto.</p>
        <Link href="/tienda" className="btn-primary">EXPLORAR LA TIENDA</Link>
      </div>
    );
  }

  return (
    <>
      <p className="listing-count">
        {favoriteProducts.length} {favoriteProducts.length === 1 ? "camiseta guardada" : "camisetas guardadas"}
      </p>
      <div className="product-grid">
        {favoriteProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} imageLoading={index === 0 ? "eager" : "lazy"} />
        ))}
      </div>
    </>
  );
}
