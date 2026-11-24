"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/components/providers/store-provider";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { getGeneralWhatsAppMessage } from "@/lib/whatsapp";
import type { NavigationItem } from "@/lib/content";

// Navegación principal (DESIGN.md → Navigation). El logo lleva a Inicio; "Tienda" sustituye al
// antiguo botón CATÁLOGO. Si el CMS define enlaces de cabecera, sustituyen a estos.
const NAV_LINKS = [
  { href: "/tienda", label: "Tienda" },
  { href: "/futbol", label: "Fútbol" },
  { href: "/training", label: "Training" },
  { href: "/personaliza", label: "Personaliza" },
  { href: "/streetwear", label: "Streetwear" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const ICONS = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  bag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>,
} satisfies Record<string, ReactNode>;

/** Contador sobre un icono; la clave cambia con el número para repetir la animación de aviso. */
function CountBadge({ count }: Readonly<{ count: number }>) {
  if (count <= 0) return null;
  return <span key={count} className="site-header-count" aria-hidden="true">{count > 99 ? "99+" : count}</span>;
}

export function Navbar({ navigation }: Readonly<{ navigation: NavigationItem[] }>) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cartCount, favoriteCount } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const whatsappMessage = getGeneralWhatsAppMessage(pathname);
  const navigationLinks = navigation.length ? navigation : NAV_LINKS;

  // Al abrir el buscador, el foco va al campo (el panel deja de estar oculto en este mismo render).
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Menú móvil: foco al primer enlace, Tab encerrado dentro y Escape devuelve el foco al botón.
  useEffect(() => {
    if (!menuOpen) return;
    const menu = mobileMenuRef.current;
    const focusableElements = Array.from(menu?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusableElements[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || focusableElements.length === 0) return;
      const first = focusableElements[0];
      const last = focusableElements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    menu?.addEventListener("keydown", onKeyDown);
    return () => menu?.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Sobre el hero de la home la cabecera es transparente hasta hacer scroll (la foto manda).
  const overHero = pathname === "/" && !scrolled && !menuOpen && !searchOpen;

  const handleSearch: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const searchToggle = (
    <button
      type="button"
      className="site-header-icon"
      onClick={() => setSearchOpen((value) => !value)}
      aria-expanded={searchOpen}
      aria-controls="site-search"
      aria-label={searchOpen ? "Cerrar buscador" : "Abrir buscador"}
    >
      <span className="site-header-glyph" aria-hidden="true">{searchOpen ? ICONS.close : ICONS.search}</span>
    </button>
  );

  return (
    <>
      <header className={`site-header${overHero ? " is-over-hero" : ""}`}>
        <div className="site-header-bar">
          <Link href="/" className="site-header-logo font-display" aria-label="LR7, ir al inicio">
            LR<span>7</span>
          </Link>

          <nav className="site-header-links" aria-label="Principal">
            {navigationLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link key={link.href} href={link.href} className={`site-header-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="site-header-actions">
            {searchToggle}
            <Link href="/favoritos" className="site-header-icon site-header-desktop-only" aria-label={favoriteCount > 0 ? `Favoritos (${favoriteCount})` : "Favoritos"}>
              <span className="site-header-glyph" aria-hidden="true">{ICONS.heart}</span>
              <CountBadge count={favoriteCount} />
            </Link>
            <Link href="/carrito" className="site-header-icon" aria-label={cartCount > 0 ? `Carrito (${cartCount} productos)` : "Carrito"}>
              <span className="site-header-glyph" aria-hidden="true">{ICONS.bag}</span>
              <CountBadge count={cartCount} />
            </Link>
            <button
              ref={mobileMenuButtonRef}
              type="button"
              className="site-header-icon site-header-mobile-only"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="site-header-glyph" aria-hidden="true">{menuOpen ? ICONS.close : ICONS.menu}</span>
            </button>
          </div>
        </div>

        {/* Cerrado, el buscador está oculto: fuera del orden de tabulación y del árbol accesible. */}
        <div id="site-search" className="site-search" hidden={!searchOpen}>
          <form onSubmit={handleSearch} className="site-search-form" role="search">
            <input
              ref={searchInputRef}
              type="search"
              className="site-search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Busca camisetas y training"
              aria-label="Buscar producto"
              enterKeyHint="search"
            />
            <button type="submit" className="btn-primary site-search-submit">BUSCAR</button>
          </form>
        </div>
      </header>

      {/* Hoja que sube desde abajo; tocar el fondo oscuro la cierra. */}
      <nav
        id="mobile-navigation"
        ref={mobileMenuRef}
        className={`site-menu${menuOpen ? " is-open" : ""}`}
        aria-label="Menú móvil"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="site-menu-panel">
        <div className="site-menu-links">
          {navigationLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={`site-menu-link font-display${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="site-menu-secondary">
          <Link href="/favoritos" className="site-menu-secondary-link">
            <span className="site-header-glyph" aria-hidden="true">{ICONS.heart}</span>
            Favoritos{favoriteCount > 0 ? ` (${favoriteCount})` : ""}
          </Link>
          <Link href="/carrito" className="site-menu-secondary-link">
            <span className="site-header-glyph" aria-hidden="true">{ICONS.bag}</span>
            Carrito{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
        </div>
        <WhatsAppLink
          message={whatsappMessage}
          className="btn-outline site-menu-whatsapp"
          eventData={{ placement: "mobile_menu", path: pathname }}
          aria-label="Contactar a LR7 por WhatsApp"
        >
          HABLA CON LR7
        </WhatsAppLink>
        </div>
      </nav>
    </>
  );
}
