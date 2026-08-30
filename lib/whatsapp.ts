import type { Product } from "@/types/ecommerce";

export type WhatsAppEventName =
  | "whatsapp_click"
  | "product_whatsapp_click"
  | "cart_whatsapp_click";

type ProductMessageOptions = {
  product: Product;
  productUrl: string;
  size?: string;
  quantity?: number;
  customName?: string;
  customNumber?: string;
};

type CartMessageItem = {
  product: Product;
  size: string;
  quantity: number;
  customName?: string;
  customNumber?: string;
};

export function getGeneralWhatsAppMessage(pathname: string) {
  if (pathname === "/" || pathname === "") {
    return "Hola LR7, tengo una pregunta sobre sus productos.";
  }

  if (pathname.startsWith("/training")) {
    return "Hola LR7, estoy buscando ropa de training. ¿Me pueden ayudar?";
  }

  if (pathname.startsWith("/futbol") || pathname.startsWith("/categorias")) {
    return "Hola LR7, estoy buscando camisetas de fútbol. ¿Me pueden ayudar?";
  }

  return "Hola LR7, ¿me pueden ayudar con una consulta?";
}

export function getProductWhatsAppMessage({
  product,
  productUrl,
  size,
  quantity,
  customName,
  customNumber,
}: ProductMessageOptions) {
  return [
    "Hola LR7, estoy interesado en:",
    product.name,
    "",
    size ? `Talla: ${size}` : "",
    quantity ? `Cantidad: ${quantity}` : "",
    customName ? `Nombre: ${customName}` : "",
    customNumber ? `Número: ${customNumber}` : "",
    `Producto: ${productUrl}`,
    "",
    "¿Me pueden ayudar con disponibilidad y tallas?",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function trackWhatsAppClick(
  eventName: WhatsAppEventName,
  eventData?: Record<string, string | number>,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("lr7:commerce", {
    detail: { event: eventName, ...eventData },
  }));

  const analyticsWindow = window as Window & {
    gtag?: (command: "event", name: string, data?: Record<string, string | number>) => void;
  };
  analyticsWindow.gtag?.("event", eventName, eventData);
}

export function getCartWhatsAppMessage(items: CartMessageItem[], formattedTotal: string) {
  const summary = items.flatMap((item) => [
    `${item.product.name} · Talla ${item.size} · Cantidad ${item.quantity}`,
    item.customName ? `Nombre: ${item.customName}` : "",
    item.customNumber ? `Número: ${item.customNumber}` : "",
  ]).filter(Boolean);

  return [
    "Hola LR7, necesito ayuda con este carrito:",
    "",
    ...summary,
    "",
    `Total: ${formattedTotal}`,
    "",
    "¿Me pueden ayudar a finalizar la compra?",
  ].join("\n");
}