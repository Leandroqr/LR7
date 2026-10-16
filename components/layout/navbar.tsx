"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { WhatsAppLink } from "@/components/commerce/whatsapp-link";
import { getGeneralWhatsAppMessage } from "@/lib/whatsapp";
import type { NavigationItem } from "@/lib/content";

const NAV_LINKS = [
  { href: "/", label: "INICIO" },
  { href: "/futbol", label: "FÚTBOL" },
  { href: "/streetwear", label: "STREET" },
  { href: "/training", label: "TRAINING" },
  { href: "/colecciones", label: "NOVEDADES" },
  { href: "/personaliza", label: "PERSONALIZA" },
];

export function Navbar({ navigation }: Readonly<{ navigation: NavigationItem[] }>) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const { cartCount, favoriteCount } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const whatsappMessage = getGeneralWhatsAppMessage(pathname);
  const navigationLinks = navigation.length ? navigation : NAV_LINKS;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };

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

  useEffect(() => {
    if (!menuOpen) return;

    const menu = mobileMenuRef.current;
    const getFocusableElements = () =>
      Array.from(menu?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    const focusableElements = getFocusableElements();
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

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;
  const textColor = isHome && !scrolled ? "rgba(255,255,255,0.95)" : "var(--color-dark)";
  const iconColor = isHome && !scrolled ? "rgba(255,255,255,0.7)" : "rgba(5,6,8,0.62)";
  const logoColor = isHome && !scrolled ? "var(--color-white)" : "var(--color-primary-dark)";

  const handleSearch: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "background 0.4s ease, padding 0.3s ease, border-color 0.4s ease",
          background: solid ? "rgba(255,255,255,0.97)" : "transparent",
          borderBottom: solid ? "1px solid rgba(7,20,38,0.1)" : "1px solid transparent",
          backdropFilter: solid ? "blur(12px)" : "none",
          padding: solid ? "0.9rem 0" : "1.4rem 0",
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="font-display" style={{ fontSize: "1.7rem", fontWeight: 900, letterSpacing: "0.08em", color: logoColor }}>
              LR<span style={{ color: "var(--color-accent)" }}>7</span>
            </div>
          </Link>

          <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }} className="hidden-mobile">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                style={{ color: pathname === link.href ? "var(--color-accent)" : textColor }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="hidden-mobile">
              <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              style={{ background: "none", border: "none", cursor: "pointer", color: iconColor, padding: "6px", transition: "color 0.2s" }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = "var(--color-accent)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = iconColor;
              }}
              aria-label="Abrir buscador"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <Link href="/favoritos" aria-label="Ver favoritos" style={{ position: "relative", color: iconColor, transition: "color 0.2s", display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {favoriteCount > 0 ? (
                <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "var(--color-accent)", color: "var(--color-dark)", fontSize: "0.6rem", fontWeight: 900, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed'" }}>
                  {favoriteCount}
                </span>
              ) : null}
            </Link>
            <Link href="/carrito" aria-label="Ver carrito" style={{ position: "relative", color: iconColor, transition: "color 0.2s", display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 ? (
                <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "var(--color-accent)", color: "var(--color-dark)", fontSize: "0.6rem", fontWeight: 900, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed'" }}>
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <Link href="/tienda" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>
              CATALOGO
            </Link>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }} className="show-mobile">
            <Link href="/carrito" aria-label="Ver carrito" style={{ position: "relative", color: "rgba(5,6,8,0.72)", display: "flex" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
              {cartCount > 0 ? (
                <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "var(--color-accent)", color: "var(--color-dark)", fontSize: "0.55rem", fontWeight: 900, width: "14px", height: "14px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed'" }}>
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <button ref={mobileMenuButtonRef} type="button" onClick={() => setMenuOpen((value) => !value)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary-dark)", padding: "4px" }} aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          style={{
            maxHeight: searchOpen ? "80px" : "0",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
            background: "rgba(255,255,255,0.97)",
            borderTop: searchOpen ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{ maxWidth: "1440px", margin: "0 auto", padding: "0.85rem 2rem", display: "flex", gap: "1rem", alignItems: "center" }}
          >
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar camiseta, equipo, seleccion..."
              style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid rgba(7,20,38,0.2)", color: "var(--color-dark)", fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.06em", outline: "none", padding: "0.4rem 0", textTransform: "uppercase" }}
              aria-label="Buscar producto"
            />
            <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}>
              BUSCAR
            </button>
          </form>
        </div>
      </nav>

      <nav
        id="mobile-navigation"
        ref={mobileMenuRef}
        aria-label="Menú móvil"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          background: "var(--color-white)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.76,0,0.24,1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "clamp(1rem, 3vh, 1.5rem)",
          boxSizing: "border-box",
          padding: "calc(5.5rem + env(safe-area-inset-top)) 1rem 1.5rem",
          overflowY: "auto",
        }}
      >
        {navigationLinks.map((link) => (
          <Link key={link.href} href={link.href} className="font-display" style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "0.08em", color: "var(--color-primary-dark)", textDecoration: "none", textTransform: "uppercase" }}>
            {link.label}
          </Link>
        ))}
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
          <Link href="/favoritos" style={{ color: "rgba(5,6,8,0.72)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", textDecoration: "none", fontSize: "0.65rem", fontFamily: "'Barlow Condensed'", letterSpacing: "0.1em" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            FAVORITOS
          </Link>
          <Link href="/carrito" style={{ color: "rgba(5,6,8,0.72)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", textDecoration: "none", fontSize: "0.65rem", fontFamily: "'Barlow Condensed'", letterSpacing: "0.1em" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
            </svg>
            CARRITO {cartCount > 0 ? `(${cartCount})` : ""}
          </Link>
        </div>
        <WhatsAppLink
          message={whatsappMessage}
          className="btn-outline"
          style={{ marginTop: "0.5rem" }}
          eventData={{ placement: "mobile_menu", path: pathname }}
          aria-label="Contactar a LR7 por WhatsApp"
        >
          HABLA CON LR7
        </WhatsAppLink>
      </nav>
    </>
  );
}
