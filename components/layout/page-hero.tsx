type PageHeroProps = {
  /** Etiqueta sobre el título: en desuso (DESIGN.md → The Titular Solo Rule); las páginas nuevas no la pasan. */
  label?: string;
  title: string;
  sub?: string;
};

// Cabecera de página tipográfica, la misma que la de /tienda (UX4).
export function PageHero({ label, title, sub }: Readonly<PageHeroProps>) {
  return (
    <header className="shop-hero page-hero">
      {label ? <p className="page-hero-label font-display">{label}</p> : null}
      <h1 className="font-display">{title}</h1>
      {sub ? <p>{sub}</p> : null}
    </header>
  );
}
