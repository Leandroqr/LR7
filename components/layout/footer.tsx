import Link from "next/link";
import { getWhatsAppUrl, SITE_CONFIG } from "@/lib/site";
import type { NavigationItem } from "@/lib/content";

type FooterLink = { label: string; href: string };

// Columnas del pie. Los enlaces del CMS se colocan en la columna que les corresponde por su dirección
// (antes se repartían por posición y podían caer bajo un título que no era el suyo); los desconocidos van a LR7.
const COLUMNS: ReadonlyArray<{ title: string; hrefs: string[] }> = [
  { title: "Tienda", hrefs: ["/tienda", "/futbol", "/training", "/colecciones", "/personaliza", "/streetwear", "/favoritos"] },
  { title: "Ayuda", hrefs: ["/envios", "/cambios-y-devoluciones", "/guia-de-tallas", "/preguntas-frecuentes", "/contacto"] },
  { title: "LR7", hrefs: ["/nosotros"] },
];

// Respaldo si el CMS no tiene enlaces de pie.
const FALLBACK_LINKS: FooterLink[] = [
  { label: "Tienda", href: "/tienda" },
  { label: "Novedades", href: "/colecciones" },
  { label: "Personaliza", href: "/personaliza" },
  { label: "Favoritos", href: "/favoritos" },
  { label: "Envíos", href: "/envios" },
  { label: "Cambios y devoluciones", href: "/cambios-y-devoluciones" },
  { label: "Guía de tallas", href: "/guia-de-tallas" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
  { label: "Nosotros", href: "/nosotros" },
];

/** Agrupa los enlaces por columna, sin repetir una misma dirección (exportado para el test). */
export function groupFooterLinks(links: FooterLink[]) {
  const seen = new Set<string>();
  const unique = links.filter((link) => {
    const key = link.href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return COLUMNS.map((column, index) => ({
    title: column.title,
    links: unique.filter((link) => {
      const path = link.href.split(/[?#]/)[0];
      const owner = COLUMNS.findIndex((candidate) => candidate.hrefs.includes(path));
      return owner === index || (owner === -1 && index === COLUMNS.length - 1);
    }),
  })).filter((column) => column.links.length > 0);
}

// Datos publicados en el CMS y en PRODUCT.md; no se anuncian medios de pago ni datos legales aún sin definir.
const PROMISES = ["Envíos a toda Colombia en 2 a 5 días hábiles", "Cambios en 5 días hábiles", "Personalización con tu nombre y número"];

export function Footer({ navigation }: Readonly<{ navigation: NavigationItem[] }>) {
  const columns = groupFooterLinks(navigation.length ? navigation.map((item) => ({ label: item.label, href: item.href })) : FALLBACK_LINKS);
  const whatsappUrl = getWhatsAppUrl("Hola LR7, tengo una pregunta.");

  return (
    <footer className="border-0 border-t border-solid border-gray-200 bg-white text-night">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 pt-14 pb-8 md:px-8 lg:grid-cols-[1.3fr_repeat(3,1fr)] lg:gap-12 lg:pt-16">
        <div className="grid content-start gap-4">
          <Link href="/" className="footer-brand font-display inline-flex min-h-11 min-w-11 w-fit items-center text-[1.75rem] font-black tracking-[0.06em] text-night no-underline" aria-label="LR7, ir al inicio">
            LR<span className="text-action">7</span>
          </Link>
          <p className="m-0 max-w-[34ch] text-body-sm leading-relaxed text-gray-600">Camisetas de fútbol de diseño propio, personalizables con tu nombre y tu número.</p>
          <ul className="m-0 grid list-none gap-1.5 p-0 text-body-sm text-gray-600">
            {PROMISES.map((promise) => <li key={promise}>{promise}</li>)}
          </ul>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-fit items-center text-body-sm font-semibold text-action underline underline-offset-4">
              Escríbenos por WhatsApp
            </a>
          ) : null}
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="m-0 mb-3 text-body-sm font-semibold text-night">{column.title}</h2>
            <ul className="footer-links m-0 grid list-none p-0">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link text-body-sm text-gray-600 no-underline hover:text-night hover:underline hover:underline-offset-3">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 border-0 border-t border-solid border-gray-200 px-4 py-6 text-caption text-gray-600 md:px-8">
        <p className="m-0">© {new Date().getFullYear()} {SITE_CONFIG.legalName}. Todos los derechos reservados.</p>
        <p className="m-0">Hecho en Colombia</p>
      </div>
    </footer>
  );
}
