import Image from "next/image";
import Link from "next/link";
import { getBadgeDisplayName, getCategoryDisplayName } from "@/lib/products";
import type { Product } from "@/types/ecommerce";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";

const CARD_SIZES = "(max-width: 767px) 50vw, (max-width: 1179px) 33vw, 25vw";

/** Una línea de contexto: lo que más ayuda a decidir (DESIGN.md → Tarjeta de producto). */
function cardMeta(product: Product, available: boolean) {
  if (!available) return "Agotado";
  if (product.brand === "TRAINING") return getCategoryDisplayName(product.category);
  if (product.personalizable) return "Personalizable";
  return getCategoryDisplayName(product.category);
}

/**
 * Tarjeta única del sitio (UX4): render o foto 4:5, nombre, una línea de contexto y precio.
 * Toda la tarjeta lleva a la ficha, donde se elige talla y se añade al carrito.
 */
export function ProductCard({ product, imageLoading = "lazy" }: Readonly<{ product: Product; imageLoading?: "eager" | "lazy" }>) {
  const available = product.variants.length > 0;
  const badge = available ? getBadgeDisplayName(product.badge) : null;
  // Segunda foto real del producto (la de su ficha), nunca inventada; solo cambia con puntero.
  const hover = product.hoverImage?.src && product.hoverImage.src !== product.images[0]?.src ? product.hoverImage : null;

  return (
    <article className={`pcard${available ? "" : " is-sold-out"}`}>
      <Link href={`/productos/${product.slug}`} className="pcard-link">
        <span className="pcard-media">
          <ProductVisual product={product} sizes={CARD_SIZES} loading={imageLoading} className="pcard-visual" />
          {hover ? <Image className="pcard-visual pcard-hover-image" src={hover.src} alt="" fill loading="lazy" sizes={CARD_SIZES} style={{ objectFit: "cover" }} /> : null}
        </span>
        <span className="pcard-body">
          <h3 className="pcard-name">{product.name}</h3>
          <span className="pcard-meta">{cardMeta(product, available)}</span>
          <Price amount={product.price.amount} className="pcard-price" />
        </span>
      </Link>
      {badge ? <Badge className="pcard-badge">{badge}</Badge> : null}
      <FavoriteButton productId={product.id} className="pcard-favorite" />
    </article>
  );
}
