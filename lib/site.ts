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

// Redes sociales (2026-11-24): solo se enlazan si la URL está configurada y es un perfil del dominio correcto.
// Nunca se inventa un perfil.
function profileUrl(value: string | undefined, hosts: readonly string[]) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && hosts.includes(url.hostname) && url.pathname.length > 1 ? url.toString() : null;
  } catch {
    return null;
  }
}

export const SOCIAL_LINKS = [
  { id: "instagram", label: "Instagram", url: profileUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL, ["instagram.com", "www.instagram.com"]) },
  { id: "tiktok", label: "TikTok", url: profileUrl(process.env.NEXT_PUBLIC_TIKTOK_URL, ["tiktok.com", "www.tiktok.com"]) },
].filter((link): link is { id: "instagram" | "tiktok"; label: string; url: string } => link.url !== null);

// Medios de pago: solo los que el dueño confirme como habilitados en su cuenta de Wompi en producción
// (NEXT_PUBLIC_PAYMENT_METHODS=card,pse,nequi,bancolombia). Vacío: el pie no muestra medios de pago.
const PAYMENT_METHOD_LABELS = {
  card: "Tarjeta de crédito o débito",
  pse: "PSE",
  nequi: "Nequi",
  bancolombia: "Botón Bancolombia",
} as const;

export const PAYMENT_METHODS = (process.env.NEXT_PUBLIC_PAYMENT_METHODS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter((value): value is keyof typeof PAYMENT_METHOD_LABELS => value in PAYMENT_METHOD_LABELS)
  .map((id) => ({ id, label: PAYMENT_METHOD_LABELS[id] }));
