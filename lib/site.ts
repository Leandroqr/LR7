const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sportco.co";
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

export const SITE_CONFIG = {
  name: "LR7",
  legalName: "LR7",
  description:
    "Camisetas de fútbol premium y ropa de training LR7 en Colombia. Explora prendas para la cancha, el entrenamiento y personalización.",
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
