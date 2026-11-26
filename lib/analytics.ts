// Analítica (2026-11-26): Google Analytics 4 con los eventos estándar de ecommerce.
// - Sin NEXT_PUBLIC_GA_MEASUREMENT_ID válido no se carga nada y cada llamada es un no-op.
// - Google solo se carga si el visitante acepta las cookies de analítica (Ley 1581): antes de aceptar,
//   window.gtag no existe y los eventos se descartan.
// Sin dependencias ni imports para poder probarlo con node --test.

const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,16}$/;

/** Devuelve el ID de medición normalizado, o "" si falta o no tiene el formato de GA4 (G-XXXXXXXXXX). */
export function parseMeasurementId(value: string | undefined) {
  const id = (value ?? "").trim().toUpperCase();
  return MEASUREMENT_ID_PATTERN.test(id) ? id : "";
}

export const GA_MEASUREMENT_ID = parseMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export function isAnalyticsConfigured() {
  return GA_MEASUREMENT_ID !== "";
}

/** Decisión del visitante sobre las cookies de analítica, guardada en su navegador. */
export const CONSENT_STORAGE_KEY = "lr7-consent-analytics";
export type ConsentChoice = "granted" | "denied";
/** Evento de ventana para volver a abrir el aviso de cookies (enlace "Preferencias de cookies" del pie). */
export const CONSENT_OPEN_EVENT = "lr7:consent-open";

export function parseConsent(value: string | null | undefined): ConsentChoice | null {
  return value === "granted" || value === "denied" ? value : null;
}

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category?: string;
  item_category2?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  index?: number;
};

type TrackableProduct = Readonly<{
  id: string | number;
  name: string;
  category?: string;
  team?: string;
  price: Readonly<{ amount: number }>;
}>;

/** Convierte un producto (o una línea del carrito) al formato de artículo de GA4. Precios en COP enteros. */
export function toAnalyticsItem(
  product: TrackableProduct,
  options: Readonly<{ price?: number; quantity?: number; variant?: string; index?: number }> = {},
): AnalyticsItem {
  const item: AnalyticsItem = {
    item_id: String(product.id),
    item_name: product.name,
    item_brand: "LR7",
    price: Math.max(0, Math.round(options.price ?? product.price.amount)),
    quantity: Math.max(1, Math.round(options.quantity ?? 1)),
  };
  if (product.category) item.item_category = product.category;
  if (product.team) item.item_category2 = product.team;
  if (options.variant) item.item_variant = options.variant;
  if (options.index !== undefined) item.index = options.index;
  return item;
}

export function itemsValue(items: readonly AnalyticsItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void };

/** Envía un evento a GA4 si Google está cargado (configurado y aceptado); si no, no hace nada. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (window as AnalyticsWindow).gtag?.("event", name, params);
}

export type EcommerceEventName =
  | "view_item_list"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_shipping_info";

/** Evento de ecommerce de GA4 con moneda y valor calculados a partir de los artículos. */
export function trackEcommerce(
  name: EcommerceEventName,
  items: readonly AnalyticsItem[],
  extra: Readonly<Record<string, unknown>> = {},
) {
  if (!items.length) return;
  trackEvent(name, { currency: "COP", value: itemsValue(items), items, ...extra });
}
