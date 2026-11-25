import Link from "next/link";
import type { ReactNode } from "react";
import { useSiteScope } from "@/components/providers/site-scope-context";
import type { NavigationItem } from "@/lib/content";
import { legalHref, SIC_URL } from "@/lib/legal-pages";
import { PAYMENT_METHODS, PAYMENT_METHODS_PLACEHOLDER, SITE_CONFIG, SOCIAL_LINKS } from "@/lib/site";
import { SupportBand } from "@/components/layout/support-band";

type FooterLink = { label: string; href: string };

// Tienda: solo camisetas de fútbol (alcance comercial 2026-11-24). Las categorías vacías no se enlazan.
const SHOP_LINKS: FooterLink[] = [
  { label: "Camisetas de fútbol", href: "/tienda" },
  { label: "Clubes", href: "/categorias/futbol-clubes" },
  { label: "Selecciones", href: "/categorias/futbol-selecciones" },
  { label: "Retro", href: "/categorias/futbol-retro" },
  { label: "Personalización", href: "/personaliza" },
];

const SERVICE_LINKS: FooterLink[] = [
  { label: "Contacto", href: "/contacto" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Guía de tallas", href: "/guia-de-tallas" },
  { label: "Envíos y entregas", href: "/envios" },
  { label: "Cambios y garantías", href: "/cambios-y-devoluciones" },
  { label: "Nosotros", href: "/nosotros" },
];

// Documentos que van en Servicio al cliente; el resto de los legales va en la franja inferior.
const SERVICE_LEGAL_SLUGS = new Set(["derecho-de-retracto", "pqr"]);

/**
 * Une los enlaces fijos con los del CMS sin repetir direcciones (exportado para el test). Los enlaces del
 * CMS que no son de la tienda se añaden a Servicio al cliente, así no se pierde lo que configure el admin.
 */
export function mergeFooterLinks(base: FooterLink[], extra: FooterLink[], skip: ReadonlySet<string>) {
  const seen = new Set(base.map((link) => link.href.split(/[?#]/)[0]));
  const added = extra.filter((link) => {
    const path = link.href.split(/[?#]/)[0];
    if (seen.has(path) || skip.has(path)) return false;
    seen.add(path);
    return true;
  });
  return [...base, ...added];
}

const ICONS: Record<"instagram" | "tiktok", ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
};

const HEADING = "m-0 mb-3 text-body-sm font-semibold text-white";
const LINK = "footer-link text-body-sm text-white/75 no-underline hover:text-white hover:underline hover:underline-offset-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark";

function LinkColumn({ title, links }: Readonly<{ title: string; links: FooterLink[] }>) {
  if (!links.length) return null;
  return (
    <nav aria-label={title}>
      <h2 className={HEADING}>{title}</h2>
      <ul className="footer-links m-0 grid list-none p-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={LINK}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Pie (2026-11-24): fondo noche y cinco columnas. Redes, medios de pago y documentos legales solo aparecen
 * cuando están configurados o publicados; nada de perfiles, medios o textos legales inventados.
 */
export function Footer({ navigation }: Readonly<{ navigation: NavigationItem[] }>) {
  const { canLink, legalPages } = useSiteScope();
  const shopPaths = new Set(SHOP_LINKS.map((link) => link.href));
  const shopLinks = SHOP_LINKS.filter((link) => canLink(link.href));
  const cmsLinks = navigation.map((item) => ({ label: item.label, href: item.href })).filter((link) => canLink(link.href));
  const serviceLegal = legalPages.filter((page) => SERVICE_LEGAL_SLUGS.has(page.slug)).map((page) => ({ label: page.label, href: legalHref(page) }));
  const serviceLinks = mergeFooterLinks([...SERVICE_LINKS, ...serviceLegal], cmsLinks, shopPaths);
  const bottomLegal = legalPages.filter((page) => !SERVICE_LEGAL_SLUGS.has(page.slug));
  return (
    <footer className="bg-night text-white">
      <SupportBand />
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 pt-14 pb-10 md:grid-cols-2 md:px-8 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-10 lg:pt-16">
        <div className="grid content-start gap-4">
          <Link href="/" className="font-display inline-flex min-h-11 min-w-11 w-fit items-center text-[1.75rem] font-black tracking-[0.06em] text-white no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark" aria-label="LR7, ir al inicio">
            LR<span className="text-action-on-dark">7</span>
          </Link>
          <p className="m-0 max-w-[34ch] text-body-sm leading-relaxed text-white/75">Camisetas de fútbol de diseño propio, inspiradas en la historia del juego y personalizables con tu nombre y tu número.</p>
          <Link href="/tienda" className="inline-flex min-h-11 w-fit items-center text-body-sm font-semibold text-action-on-dark underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark">
            Ver las camisetas
          </Link>
        </div>

        <LinkColumn title="Tienda" links={shopLinks} />
        <LinkColumn title="Servicio al cliente" links={serviceLinks} />

        {SOCIAL_LINKS.length ? (
          <div>
            <h2 className={HEADING}>Síguenos</h2>
            <ul className="m-0 flex list-none gap-2 p-0">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.placeholder ? `${social.label} (se abre en una pestaña nueva)` : `${social.label} de LR7 (se abre en una pestaña nueva)`}
                    className="grid size-11 place-items-center rounded-full border border-solid border-white/20 text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-action-on-dark [&>svg]:size-5"
                  >
                    {ICONS[social.id]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {PAYMENT_METHODS.length ? (
          <div>
            <h2 className={HEADING}>Medios de pago</h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {PAYMENT_METHODS.map((method) => (
                <li key={method.id} className="rounded-button border border-solid border-white/20 px-3 py-1.5 text-caption font-semibold text-white">{method.label}</li>
              ))}
            </ul>
            {/* Mientras el checkout no esté activo en producción no se promete que ya se pueda pagar en línea. */}
            <p className="m-0 mt-3 text-caption text-white/60">{PAYMENT_METHODS_PLACEHOLDER ? "Pago en línea próximamente." : "Pagos procesados por Wompi."}</p>
          </div>
        ) : null}
      </div>

      <div className="border-0 border-t border-solid border-white/10">
        <div className="footer-bottom mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 md:px-8 lg:flex-row lg:items-center lg:justify-between [body:has(.whatsapp-float)_&]:pb-[88px] lg:[body:has(.whatsapp-float)_&]:pr-[220px] lg:[body:has(.whatsapp-float)_&]:pb-6">
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-1 p-0">
            {bottomLegal.map((page) => (
              <li key={page.slug}><Link href={legalHref(page)} className={`${LINK} inline-flex min-h-11 items-center text-caption`}>{page.label}</Link></li>
            ))}
            <li>
              <a href={SIC_URL} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex min-h-11 items-center text-caption`}>
                Superintendencia de Industria y Comercio (SIC)<span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </li>
          </ul>
          <p className="m-0 text-caption text-white/60">© {new Date().getFullYear()} {SITE_CONFIG.legalName}. Hecho en Colombia.</p>
        </div>
      </div>
    </footer>
  );
}
