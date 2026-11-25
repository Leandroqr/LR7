import { LOCAL_SITE_URL } from "./site-url";

// LR7_SITE_URL se fija en el build desde next.config.ts (resolveSiteUrl) y se inyecta
// igual en servidor y navegador, para que canonical, sitemap y enlaces coincidan.
const siteUrl = process.env.LR7_SITE_URL || LOCAL_SITE_URL;
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

export const SITE_CONFIG = {
  name: "LR7",
  legalName: "LR7",
  description:
    "Camisetas de fútbol LR7 en Colombia: diseño propio inspirado en la historia del juego, personalizables con tu nombre y tu número.",
  baseUrl: siteUrl,
  locale: "es_CO",
  keywords: [
    "camisetas de futbol",
    "camisetas de futbol en colombia",
    "camisetas de futbol premium",
    "camisetas de futbol personalizadas",
    "camisetas deportivas",
    "camisetas de futbol para hombre",
    "camisetas de futbol para mujer",
    "lr7",
  ],
  whatsappNumber,
};

export function getWhatsAppUrl(message?: string) {
  if (!isWhatsAppConfigured()) return null;

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}${query}`;
}

export function isWhatsAppConfigured() {
  return /^\d{10,15}$/.test(SITE_CONFIG.whatsappNumber);
}

export const COMPANY = {
  country: "CO",
  currency: "COP" as const,
};

// ============================================================================================================
// DATOS TEMPORALES (decisión del dueño, 2026-11-24). Mientras no estén los reales, la tienda muestra
// marcadores SEGUROS: nunca un número ni un perfil inventado que pueda ser de otra persona.
// - WhatsApp sin número: los botones llevan a /contacto.
// - Redes sin URL: cada icono lleva a la portada de su red.
// - Medios de pago sin confirmar: tarjeta, PSE, Nequi y Addi con el aviso "Pago en línea próximamente".
// Para poner los reales, definir en Vercel (o aquí) NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_INSTAGRAM_URL,
// NEXT_PUBLIC_TIKTOK_URL y NEXT_PUBLIC_PAYMENT_METHODS: en cuanto existen, sustituyen a los marcadores.
// ============================================================================================================
export const PLACEHOLDER_CONTACT_HREF = "/contacto";
const PLACEHOLDER_SOCIAL = { instagram: "https://www.instagram.com/", tiktok: "https://www.tiktok.com/" } as const;
const PLACEHOLDER_PAYMENT_METHODS = ["card", "pse", "nequi", "addi"] as const;

/** Enlace de atención: WhatsApp con el mensaje si hay número; si no, la página de contacto (temporal). */
export function getSupportLink(message: string): { href: string; external: boolean; whatsapp: boolean } {
  const whatsappUrl = getWhatsAppUrl(message);
  return whatsappUrl ? { href: whatsappUrl, external: true, whatsapp: true } : { href: PLACEHOLDER_CONTACT_HREF, external: false, whatsapp: false };
}

// Redes sociales: la URL configurada si es un perfil del dominio correcto; si no, el marcador temporal.
function profileUrl(value: string | undefined, hosts: readonly string[]) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && hosts.includes(url.hostname) && url.pathname.length > 1 ? url.toString() : null;
  } catch {
    return null;
  }
}

const instagramUrl = profileUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL, ["instagram.com", "www.instagram.com"]);
const tiktokUrl = profileUrl(process.env.NEXT_PUBLIC_TIKTOK_URL, ["tiktok.com", "www.tiktok.com"]);

export const SOCIAL_LINKS: ReadonlyArray<{ id: "instagram" | "tiktok"; label: string; url: string; placeholder: boolean }> = [
  { id: "instagram", label: "Instagram", url: instagramUrl ?? PLACEHOLDER_SOCIAL.instagram, placeholder: !instagramUrl },
  { id: "tiktok", label: "TikTok", url: tiktokUrl ?? PLACEHOLDER_SOCIAL.tiktok, placeholder: !tiktokUrl },
];

// Medios de pago: los confirmados en producción (NEXT_PUBLIC_PAYMENT_METHODS=card,pse,nequi,bancolombia,addi);
// sin configurar, los marcadores temporales con el aviso de que el pago en línea aún no está activo.
const PAYMENT_METHOD_LABELS = {
  card: "Tarjeta de crédito o débito",
  pse: "PSE",
  nequi: "Nequi",
  bancolombia: "Botón Bancolombia",
  addi: "Addi",
} as const;

const configuredPaymentMethods = (process.env.NEXT_PUBLIC_PAYMENT_METHODS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter((value): value is keyof typeof PAYMENT_METHOD_LABELS => value in PAYMENT_METHOD_LABELS);

export const PAYMENT_METHODS_PLACEHOLDER = configuredPaymentMethods.length === 0;
export const PAYMENT_METHODS = (PAYMENT_METHODS_PLACEHOLDER ? [...PLACEHOLDER_PAYMENT_METHODS] : configuredPaymentMethods).map((id) => ({ id, label: PAYMENT_METHOD_LABELS[id] }));
