"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/types/ecommerce";
import { FavoriteButton } from "@/components/product/favorite-button";

const BADGE_LABELS: Record<string, string> = {
  NUEVO: "NUEVO",
  "MAS VENDIDA": "BEST SELLER",
  LIMITADA: "EDICION LIMITADA",
};

function getUniqueVariants(product: Product) {
  return product.variants.filter(
    (variant, index, variants) =>
      variants.findIndex((candidate) => candidate.size === variant.size) === index,
  );
}

function getQuickAddLabel(added: boolean, hasSelection: boolean, available: boolean) {
  if (added) return "AÑADIDO";
  if (hasSelection) return "AÑADIR AL CARRITO";
  return available ? "ELIGE TALLA" : "AGOTADO";
}

export function ProductCard({ product, imageLoading = "lazy" }: Readonly<{ product: Product; imageLoading?: "eager" | "lazy" }>) {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const { addToCart } = useStore();
  const productHref = `/productos/${product.slug}`;
  const availableVariants = getUniqueVariants(product);
  const selectedVariant = availableVariants.find((variant) => variant.size === selectedSize);
  const available = availableVariants.length > 0;
  const quickAddLabel = getQuickAddLabel(added, Boolean(selectedVariant), available);

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [added]);

  const handleAdd = () => {
    if (!selectedVariant) return;
    addToCart({
      product,
      variant: selectedVariant,
      size: selectedVariant.size,
      customName: "",
      customNumber: "",
      unitPrice: product.price.amount,
      quantity: 1,
    });
    setAdded(true);
  };

  return (
    <article
      className="product-card shop-product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-img-wrap shop-product-media">
        <Link href={productHref} className="shop-product-image-link" aria-label={`Ver ${product.name}`}>
          <Image
            className="product-img"
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            loading={imageLoading}
            sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: "cover", opacity: hovered ? 0 : 1 }}
          />
          <Image
            className="product-img shop-product-hover-image"
            src={product.hoverImage.src}
            alt={product.hoverImage.alt}
            fill
            loading="lazy"
            sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: "cover", opacity: hovered ? 1 : 0 }}
          />
        </Link>

        {product.badge ? (
          <span className={`shop-product-badge shop-product-badge-${product.badge.toLowerCase().replaceAll(" ", "-")}`}>
            {BADGE_LABELS[product.badge] ?? product.badge}
          </span>
        ) : null}
        <FavoriteButton productId={product.id} />
        {product.personalizable ? <span className="shop-product-customizable">PERSONALIZABLE</span> : null}
      </div>

      <div className="shop-product-info">
        <div className="shop-product-context">
          <span>{product.brand === "FUTBOL" ? product.team : "LR7 TRAINING"}</span>
          <span>{available ? "DISPONIBLE" : "AGOTADO"}</span>
        </div>
        <h2><Link href={productHref}>{product.name}</Link></h2>
        <p className="shop-product-price" aria-label={`Precio ${formatCurrency(product.price.amount)} pesos colombianos`}>
          ${formatCurrency(product.price.amount)}
        </p>

        <div className="shop-product-actions">
          {available ? (
            <fieldset className="shop-quick-sizes">
              <legend>SELECCIONA TALLA</legend>
              <div>
                {availableVariants.map((variant) => (
                  <button
                    type="button"
                    key={variant.size}
                    className={selectedSize === variant.size ? "is-selected" : ""}
                    onClick={() => { setSelectedSize(variant.size); setAdded(false); }}
                    aria-pressed={selectedSize === variant.size}
                    aria-label={`Talla ${variant.size}`}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <button
            type="button"
            className="shop-quick-add"
            onClick={handleAdd}
            disabled={!selectedVariant || !available}
          >
            <span>{quickAddLabel}</span>
            <span aria-hidden="true">{added ? "✓" : "→"}</span>
          </button>

          {product.personalizable ? (
            <Link className="shop-personalize-link" href={`/personaliza?producto=${encodeURIComponent(product.slug)}`}>
              PERSONALIZAR <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
        <p className="shop-card-status" aria-live="polite">
          {added ? `${product.name}, talla ${selectedSize}, añadido al carrito.` : ""}
        </p>
      </div>
    </article>
  );
}
