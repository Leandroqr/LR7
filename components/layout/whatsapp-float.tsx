"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { useStore } from "@/components/providers/store-provider";
import { getCartSubtotal } from "@/lib/cart-pricing";
import { CUSTOM_PRICE, formatCurrency } from "@/lib/products";
import { isWhatsAppConfigured, PLACEHOLDER_CONTACT_HREF, SITE_CONFIG } from "@/lib/site";
import {
  getCartWhatsAppMessage,
  getGeneralWhatsAppMessage,
  getProductWhatsAppMessage,
  type WhatsAppEventName,
} from "@/lib/whatsapp";

export type WhatsAppProduct = Readonly<{ slug: string; name: string }>;

export const WHATSAPP_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/**
 * Botón flotante de atención: círculo en móvil y píldora "¿Te ayudamos?" en escritorio. Mensaje según el
 * contexto: producto, carrito, pedido o consulta general. Los productos llegan del catálogo público real desde
 * el layout. Sin número de WhatsApp lleva a /contacto (marcador temporal de lib/site.ts).
 */
export function WhatsAppFloat({ products }: Readonly<{ products: WhatsAppProduct[] }>) {
  const pathname = usePathname();
  const { cart } = useStore();
  const product = products.find((item) => pathname === `/productos/${item.slug}`);
  let message = getGeneralWhatsAppMessage(pathname);
  let eventName: WhatsAppEventName = "whatsapp_click";

  if (product) {
    message = getProductWhatsAppMessage({ product, productUrl: `${SITE_CONFIG.baseUrl.replace(/\/$/, "")}${pathname}` });
    eventName = "product_whatsapp_click";
  } else if (pathname === "/carrito" && cart.length > 0) {
    message = getCartWhatsAppMessage(cart, `$${formatCurrency(getCartSubtotal(cart, CUSTOM_PRICE))}`);
    eventName = "cart_whatsapp_click";
  }

  // CTA B: icono y etiqueta visible "¿Te ayudamos?" (la etiqueta solo se ve en escritorio).
  const content = (
    <>
      {WHATSAPP_ICON}
      <span className="whatsapp-float-label" aria-hidden="true">¿Te ayudamos?</span>
    </>
  );

  // Sin número configurado: marcador temporal seguro, la página de contacto (nunca un número inventado).
  if (!isWhatsAppConfigured()) {
    return (
      <Link href={PLACEHOLDER_CONTACT_HREF} className="whatsapp-float" aria-label="¿Te ayudamos? Contacta a LR7">
        {content}
      </Link>
    );
  }

  return (
    <WhatsAppLink
      message={message}
      className="whatsapp-float"
      aria-label="¿Te ayudamos? Escribe a LR7 por WhatsApp (se abre en una pestaña nueva)"
      eventName={eventName}
      eventData={{ placement: "floating_button", path: pathname }}
    >
      {content}
    </WhatsAppLink>
  );
}
