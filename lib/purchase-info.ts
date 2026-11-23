// Convierte el contenido del CMS (envíos, cambios, guía de tallas) en datos compactos para la ficha.
// Función pura: sin datos devuelve listas vacías y la ficha muestra solo los enlaces de siempre.
// No inventa plazos ni políticas: solo reutiliza lo publicado en el CMS.

type CmsItem = Readonly<{ title: string; body: string | null; configuration?: unknown }>;

export type PurchaseInfoItem = Readonly<{ title: string; body: string }>;
export type SizeGuideRow = Readonly<{ size: string; chest: string; length: string; shoulder: string }>;

const MAX_SHIPPING_ITEMS = 2;
const MAX_RETURNS_ITEMS = 1;

function withBody(items: readonly CmsItem[]): PurchaseInfoItem[] {
  return items.flatMap((item) => {
    const title = item.title.trim();
    const body = item.body?.trim() ?? "";
    return title && body ? [{ title, body }] : [];
  });
}

export function buildPurchaseInfo(shipping: readonly CmsItem[], returns: readonly CmsItem[]): PurchaseInfoItem[] {
  return [...withBody(shipping).slice(0, MAX_SHIPPING_ITEMS), ...withBody(returns).slice(0, MAX_RETURNS_ITEMS)];
}

function measurement(configuration: unknown, key: "chest" | "length" | "shoulder") {
  if (!configuration || typeof configuration !== "object") return "-";
  const value = (configuration as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "-";
}

export function buildSizeGuide(rows: readonly CmsItem[]): SizeGuideRow[] {
  return rows.flatMap((row) => {
    const size = row.title.trim();
    return size ? [{ size, chest: measurement(row.configuration, "chest"), length: measurement(row.configuration, "length"), shoulder: measurement(row.configuration, "shoulder") }] : [];
  });
}
