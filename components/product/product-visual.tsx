import Image from "next/image";
import type { Product } from "@/types/ecommerce";
import { DorsalJersey, JERSEY_PALETTES } from "@/components/graphics/dorsal-jersey";
import { jerseyNumberFor, jerseyPaletteFor } from "@/lib/product-visual";

/**
 * Imagen principal de un producto: su foto del catálogo (de stock mientras el dueño no suba fotos
 * propias; decisión del 2026-11-23). Solo si el producto no tiene ninguna imagen se dibuja el render
 * plano, con el dorsal del cliente cuando la línea del carrito va personalizada.
 * Sin hooks: sirve en servidor y cliente.
 */
export function ProductVisual({
  product,
  sizes,
  loading = "lazy",
  className,
  dorsal,
}: Readonly<{ product: Product; sizes: string; loading?: "eager" | "lazy"; className?: string; dorsal?: { name: string; number: string } }>) {
  const image = product.images[0];
  if (image?.src) {
    return (
      <Image className={className} src={image.src} alt={image.alt} fill loading={loading} sizes={sizes} style={{ objectFit: "cover" }} />
    );
  }
  const dorsalName = dorsal?.name.trim() ?? "";
  const dorsalNumber = dorsal?.number.trim() ?? "";
  const personalized = Boolean(dorsalName || dorsalNumber);
  return (
    <DorsalJersey
      className={className}
      name={dorsalName}
      number={personalized ? dorsalNumber : jerseyNumberFor(product)}
      palette={JERSEY_PALETTES[jerseyPaletteFor(product)]}
      label={personalized ? undefined : `Ilustración de ${product.name}`}
    />
  );
}
