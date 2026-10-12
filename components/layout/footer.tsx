import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site";
import type { NavigationItem } from "@/lib/content";

const FOOTER_COLUMNS = [
  {
    title: "TIENDA",
    links: [
      { label: "Catalogo", href: "/tienda" },
      { label: "Colecciones", href: "/colecciones" },
      { label: "Personaliza", href: "/personaliza" },
      { label: "Favoritos", href: "/favoritos" },
    ],
  },
  {
    title: "AYUDA",
    links: [
      { label: "Como comprar", href: "/contacto" },
      { label: "Envios", href: "/envios" },
      { label: "Cambios y devoluciones", href: "/cambios-y-devoluciones" },
      { label: "Contacto", href: "/contacto" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
    ],
  },
  {
    title: "LR7",
    links: [
      { label: "Nosotros", href: "/nosotros" },
      { label: "Guia de tallas", href: "/guia-de-tallas" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
    ],
  },
];

export function Footer({ navigation }: Readonly<{ navigation: NavigationItem[] }>) {
  const footerLinks = navigation.length ? navigation : FOOTER_COLUMNS.flatMap((column) => column.links);
  return (
    <footer style={{ background: "var(--color-white)", borderTop: "1px solid rgba(7,20,38,0.1)", padding: "4rem 0 2rem", color: "var(--color-dark)" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "3rem" }} className="footer-grid">
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div className="font-display" style={{ fontSize: "1.7rem", fontWeight: 900, letterSpacing: "0.08em", color: "var(--color-primary-dark)", marginBottom: "1rem" }}>
                LR<span style={{ color: "var(--color-accent)" }}>7</span>
              </div>
            </Link>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.7, fontWeight: 300, maxWidth: "220px" }}>
              Camisetas deportivas premium para quienes viven el juego con pasion.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column, index) => {
            const links = navigation.length ? footerLinks.filter((_, linkIndex) => linkIndex % 3 === index) : column.links;
            return <div key={column.title}>
              <p className="font-display" style={{ fontSize: "0.8rem", letterSpacing: "0.2em", color: "var(--color-accent)", textTransform: "uppercase", marginBottom: "1.25rem", fontWeight: 700 }}>
                {column.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {links.map((link) => (
                  <Link key={link.label} href={link.href} style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", textDecoration: "none", fontWeight: 300, transition: "color 0.2s" }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>;
          })}
        </div>
        <div style={{ borderTop: "1px solid rgba(7,20,38,0.1)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 300 }}>
            © 2026 {SITE_CONFIG.legalName}. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "'Barlow Condensed'", fontWeight: 600, letterSpacing: "0.1em" }}>
            HECHO EN COLOMBIA
          </p>
        </div>
      </div>
    </footer>
  );
}
