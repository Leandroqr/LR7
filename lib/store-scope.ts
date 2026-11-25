import type { ProductBrand } from "@/types/ecommerce";

/**
 * Alcance comercial de la tienda (2026-11-24): hoy LR7 vende solo camisetas de fútbol.
 * Training y Streetwear se conservan completos (rutas, componentes y datos) pero no se muestran.
 * Para activarlos basta con configurar, sin tocar código:
 *   NEXT_PUBLIC_STORE_LINES=FUTBOL,TRAINING   → líneas de producto a la venta (por defecto, FUTBOL)
 *   NEXT_PUBLIC_STREETWEAR_ENABLED=true       → sección editorial /streetwear
 * Son públicas (NEXT_PUBLIC_) porque las leen también componentes de cliente (menú, pie, WhatsApp).
 */
const KNOWN_LINES: readonly ProductBrand[] = ["FUTBOL", "TRAINING"];

function parseLines(raw: string | undefined): ReadonlySet<ProductBrand> {
  const lines = (raw ?? "FUTBOL")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter((value): value is ProductBrand => (KNOWN_LINES as readonly string[]).includes(value));
  return new Set(lines.length ? lines : ["FUTBOL"]);
}

export const ACTIVE_LINES = parseLines(process.env.NEXT_PUBLIC_STORE_LINES);
export const STREETWEAR_ENABLED = process.env.NEXT_PUBLIC_STREETWEAR_ENABLED === "true";

export function isLineActive(brand: ProductBrand) {
  return ACTIVE_LINES.has(brand);
}

/** Solo los productos de las líneas a la venta. */
export function filterActiveProducts<T extends { brand: ProductBrand }>(products: T[]): T[] {
  return products.filter((product) => isLineActive(product.brand));
}

/**
 * ¿Se puede enlazar esta dirección? Falso para secciones ocultas (Training, Streetwear) y para la tienda
 * filtrada por una línea oculta. Se usa con los enlaces fijos y con los que llegan del CMS.
 */
export function isPublicHrefEnabled(href: string) {
  const [path, query = ""] = href.split("?");
  if (!isLineActive("TRAINING") && (path.startsWith("/training") || /(^|&)(brand|cat)=TRAINING/i.test(query))) return false;
  if (!STREETWEAR_ENABLED && path.startsWith("/streetwear")) return false;
  return true;
}
