// Cómo se representa un producto en la tienda (DESIGN.md → Tarjeta de producto).
// Las fotos de stock (Unsplash) llevan escudos y logos de terceros; mientras el admin no suba fotos
// propias, se dibuja un render plano de la camiseta. Sin dependencias para node --test.

export type JerseyPaletteKey = "night" | "white" | "action" | "steel" | "chalk";

const STOCK_HOSTS = new Set(["images.unsplash.com", "plus.unsplash.com"]);
const FOOTBALL_PALETTES: readonly JerseyPaletteKey[] = ["night", "white", "action", "chalk", "steel"];
const TRAINING_PALETTES: readonly JerseyPaletteKey[] = ["steel", "night", "chalk"];

/** Una foto de stock no se muestra como foto de producto. Las rutas del bucket de Supabase sí. */
export function isStockImage(src: string | undefined | null) {
  if (!src) return true;
  try {
    return STOCK_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

function hash(value: string) {
  let result = 0;
  for (const char of value) result = (result * 31 + char.codePointAt(0)!) >>> 0;
  return result;
}

/** Paleta estable por producto: el mismo slug siempre da el mismo color. */
export function jerseyPaletteFor(product: Readonly<{ slug: string; brand: string }>): JerseyPaletteKey {
  const palettes = product.brand === "TRAINING" ? TRAINING_PALETTES : FOOTBALL_PALETTES;
  return palettes[hash(product.slug) % palettes.length];
}

/** Número del render: los dos últimos dígitos del nombre ("Brasil 82" → 82); si no hay, 10 (o 7 en training). */
export function jerseyNumberFor(product: Readonly<{ name: string; brand: string }>) {
  const digits = product.name.match(/\d+/g)?.at(-1);
  if (digits) return digits.slice(-2);
  return product.brand === "TRAINING" ? "7" : "10";
}
