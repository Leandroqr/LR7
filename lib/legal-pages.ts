/**
 * Documentos legales de la tienda (Ley 1480 de 2011, Ley 1581 de 2012, Decreto 1074 de 2015).
 * El texto NO vive en el código: lo carga el administrador en el CMS (content_items, con el page_key de cada
 * documento) después de que un abogado lo apruebe. Mientras un documento no tenga texto publicado, su página
 * responde 404 y no se enlaza en ningún sitio: nunca se publica un texto provisional como si fuera legal.
 */
export type LegalPage = Readonly<{ slug: string; pageKey: string; label: string; title: string; description: string }>;

export const LEGAL_PAGES: readonly LegalPage[] = [
  { slug: "terminos-y-condiciones", pageKey: "legal-terminos", label: "Términos y condiciones", title: "TÉRMINOS Y CONDICIONES", description: "Condiciones de compra en LR7." },
  { slug: "tratamiento-de-datos", pageKey: "legal-datos", label: "Tratamiento de datos personales", title: "TRATAMIENTO DE DATOS PERSONALES", description: "Política de tratamiento de datos personales de LR7." },
  { slug: "aviso-de-privacidad", pageKey: "legal-privacidad", label: "Aviso de privacidad", title: "AVISO DE PRIVACIDAD", description: "Aviso de privacidad de LR7." },
  { slug: "derecho-de-retracto", pageKey: "legal-retracto", label: "Derecho de retracto", title: "DERECHO DE RETRACTO", description: "Cómo ejercer el derecho de retracto en LR7." },
  { slug: "reversion-del-pago", pageKey: "legal-reversion", label: "Reversión del pago", title: "REVERSIÓN DEL PAGO", description: "Cómo solicitar la reversión de un pago en LR7." },
  { slug: "pqr", pageKey: "legal-pqr", label: "Peticiones, quejas y reclamos", title: "PETICIONES, QUEJAS Y RECLAMOS", description: "Canal de peticiones, quejas y reclamos de LR7." },
];

export const SIC_URL = "https://www.sic.gov.co/";

export function legalHref(page: LegalPage) {
  return `/legal/${page.slug}`;
}
